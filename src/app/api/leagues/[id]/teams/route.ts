import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireCommunityRole } from "@/lib/session";

/**
 * POST /api/leagues/[id]/teams — Invite/add a team to the league
 * Body: { teamId }
 *
 * If the team belongs to the same community → auto-ACCEPTED
 * If different community → PENDING (team's mod must accept)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id: leagueId } = await params;

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      select: { communityId: true },
    });
    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    // Caller must be mod of league's community
    const roleCheck = await requireCommunityRole(user, league.communityId, "COMMUNITY_MOD", "ADMIN");
    if (roleCheck) return roleCheck;

    const { teamId } = await req.json();

    if (!teamId) {
      return NextResponse.json({ error: "teamId is required" }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, communityId: true },
    });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check not already in league
    const existing = await prisma.leagueTeam.findUnique({
      where: { leagueId_teamId: { leagueId, teamId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Team already in league" }, { status: 400 });
    }

    // Same community = auto-accept, different = pending
    const status = team.communityId === league.communityId ? "ACCEPTED" : "PENDING";

    const leagueTeam = await prisma.leagueTeam.create({
      data: { leagueId, teamId, status },
    });

    return NextResponse.json(leagueTeam, { status: 201 });
  } catch (error) {
    console.error("Error adding team to league:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/leagues/[id]/teams — Accept/reject league invite (for invited team's mod)
 * Body: { teamId, action: "ACCEPTED" | "REJECTED" }
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id: leagueId } = await params;
    const { teamId, action } = await req.json();

    if (!teamId || !["ACCEPTED", "REJECTED"].includes(action)) {
      return NextResponse.json({ error: "teamId and action required" }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { communityId: true },
    });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // The accepting mod must own the team's community
    const roleCheck = await requireCommunityRole(user, team.communityId, "COMMUNITY_MOD", "ADMIN");
    if (roleCheck) return roleCheck;

    if (action === "ACCEPTED") {
      // Team is already in the league, no change needed
      const leagueTeam = await prisma.leagueTeam.findUnique({
        where: { leagueId_teamId: { leagueId, teamId } },
      });
      return NextResponse.json(leagueTeam);
    } else {
      // Remove team from league
      await prisma.leagueTeam.delete({
        where: { leagueId_teamId: { leagueId, teamId } },
      });
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error updating league team:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
