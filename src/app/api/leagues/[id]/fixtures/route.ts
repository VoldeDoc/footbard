import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireCommunityRole } from "@/lib/session";

/**
 * POST /api/leagues/[id]/fixtures — Generate round-robin fixtures for the league
 * Body: { startDate: string (ISO), intervalDays?: number, venue?: string }
 *
 * Only accepted teams participate. Each team plays every other team once (home & away).
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

    const roleCheck = await requireCommunityRole(user, league.communityId, "COMMUNITY_MOD");
    if (roleCheck) return roleCheck;

    // Check no existing matches
    const existing = await prisma.match.count({ where: { leagueId } });
    if (existing > 0) {
      return NextResponse.json({ error: "Fixtures already generated. Delete existing matches first." }, { status: 400 });
    }

    const { startDate, intervalDays = 7, venue } = await req.json();

    if (!startDate) {
      return NextResponse.json({ error: "startDate is required" }, { status: 400 });
    }

    // Get accepted teams
    const leagueTeams = await prisma.leagueTeam.findMany({
      where: { leagueId, status: "ACCEPTED" },
      select: { teamId: true },
    });

    if (leagueTeams.length < 2) {
      return NextResponse.json({ error: "Need at least 2 accepted teams to generate fixtures" }, { status: 400 });
    }

    const teamIds = leagueTeams.map((lt) => lt.teamId);

    // Round-robin: each pair plays home & away
    const fixtures: { homeTeamId: string; awayTeamId: string }[] = [];
    for (let i = 0; i < teamIds.length; i++) {
      for (let j = 0; j < teamIds.length; j++) {
        if (i !== j) {
          fixtures.push({ homeTeamId: teamIds[i], awayTeamId: teamIds[j] });
        }
      }
    }

    // Spread fixtures across matchdays
    const baseDate = new Date(startDate);
    const matches = fixtures.map((f, idx) => {
      const matchDate = new Date(baseDate);
      matchDate.setDate(matchDate.getDate() + Math.floor(idx / Math.max(1, Math.floor(teamIds.length / 2))) * intervalDays);
      return {
        leagueId,
        homeTeamId: f.homeTeamId,
        awayTeamId: f.awayTeamId,
        matchDate,
        venue: venue || null,
        status: "SCHEDULED" as const,
      };
    });

    await prisma.match.createMany({ data: matches });

    const created = await prisma.match.findMany({
      where: { leagueId },
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true } },
        awayTeam: { select: { id: true, name: true, shortName: true } },
      },
      orderBy: { matchDate: "asc" },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error generating fixtures:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
