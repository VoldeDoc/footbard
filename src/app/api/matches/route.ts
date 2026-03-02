import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireCommunityRole } from "@/lib/session";
import { updateStandings } from "@/lib/standings";
import { isDemoUser, DEMO_MATCHES } from "@/lib/demo-data";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    if (isDemoUser(user.email)) {
      const { searchParams } = new URL(req.url);
      const leagueId = searchParams.get("leagueId");
      const data = leagueId ? DEMO_MATCHES.filter((m) => m.leagueId === leagueId) : DEMO_MATCHES;
      return NextResponse.json(data);
    }

    const { searchParams } = new URL(req.url);
    const leagueId = searchParams.get("leagueId");

    const matches = await prisma.match.findMany({
      where: leagueId ? { leagueId } : undefined,
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true, logo: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, logo: true } },
        league: { select: { id: true, name: true, communityId: true } },
        _count: { select: { events: true } },
      },
      orderBy: { matchDate: "desc" },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (isDemoUser(user.email)) return NextResponse.json({ success: true, demo: true });

    const { leagueId, homeTeamId, awayTeamId, matchDate, venue, status } = await req.json();

    if (!leagueId || !homeTeamId || !awayTeamId || !matchDate) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Verify league + community role
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      select: { communityId: true },
    });
    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    const roleCheck = await requireCommunityRole(user, league.communityId, "COMMUNITY_MOD", "ADMIN");
    if (roleCheck) return roleCheck;

    const match = await prisma.match.create({
      data: {
        leagueId,
        homeTeamId,
        awayTeamId,
        matchDate: new Date(matchDate),
        venue,
        status: status || "SCHEDULED",
      },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (isDemoUser(user.email)) return NextResponse.json({ success: true, demo: true });

    const { id, homeScore, awayScore, status, recap } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Match ID is required" }, { status: 400 });
    }

    // Check community role via match -> league
    const existingMatch = await prisma.match.findUnique({
      where: { id },
      include: { league: { select: { communityId: true } } },
    });
    if (!existingMatch) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const roleCheck = await requireCommunityRole(user, existingMatch.league.communityId, "COMMUNITY_MOD", "ADMIN");
    if (roleCheck) return roleCheck;

    const match = await prisma.match.update({
      where: { id },
      data: {
        ...(homeScore !== undefined && { homeScore }),
        ...(awayScore !== undefined && { awayScore }),
        ...(status && { status }),
        ...(recap && { recap }),
      },
    });

    if (status === "COMPLETED") {
      await updateStandings(match.id);
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
