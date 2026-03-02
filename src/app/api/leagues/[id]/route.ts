import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireCommunityRole } from "@/lib/session";

/**
 * GET /api/leagues/[id] — Get league details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await params;

    const league = await prisma.league.findUnique({
      where: { id },
      include: {
        community: { select: { id: true, name: true } },
        leagueTeams: {
          include: {
            team: {
              select: { id: true, name: true, shortName: true, logo: true, communityId: true },
            },
          },
        },
        matches: {
          include: {
            homeTeam: { select: { id: true, name: true, shortName: true, logo: true } },
            awayTeam: { select: { id: true, name: true, shortName: true, logo: true } },
          },
          orderBy: { matchDate: "asc" },
        },
        standings: {
          include: { team: { select: { id: true, name: true, shortName: true, logo: true } } },
          orderBy: [{ points: "desc" }, { goalDifference: "desc" }, { goalsFor: "desc" }],
        },
      },
    });

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    return NextResponse.json(league);
  } catch (error) {
    console.error("Error fetching league:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
