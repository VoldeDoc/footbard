import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/homepage
 *
 * Public endpoint (no auth required).
 * Returns data for the homepage: live matches, upcoming fixtures,
 * top players, and community spotlight.
 */
export async function GET() {
  try {
    const [liveMatches, upcomingMatches, topPlayers, communities] = await Promise.all([
      // Live or recently completed matches
      prisma.match.findMany({
        where: {
          status: { in: ["LIVE", "COMPLETED"] },
        },
        include: {
          homeTeam: { select: { name: true, shortName: true, logo: true } },
          awayTeam: { select: { name: true, shortName: true, logo: true } },
          league: { select: { name: true } },
        },
        orderBy: { matchDate: "desc" },
        take: 6,
      }),

      // Upcoming scheduled matches
      prisma.match.findMany({
        where: {
          status: "SCHEDULED",
          matchDate: { gte: new Date() },
        },
        include: {
          homeTeam: { select: { name: true, shortName: true, logo: true } },
          awayTeam: { select: { name: true, shortName: true, logo: true } },
          league: { select: { name: true } },
        },
        orderBy: { matchDate: "asc" },
        take: 6,
      }),

      // Top scorers
      prisma.player.findMany({
        where: { goals: { gt: 0 }, isBanned: false },
        select: {
          id: true,
          name: true,
          goals: true,
          assists: true,
          team: { select: { name: true } },
        },
        orderBy: { goals: "desc" },
        take: 8,
      }),

      // Community spotlight (non-suspended, with counts)
      prisma.community.findMany({
        where: { isSuspended: false },
        select: {
          id: true,
          name: true,
          description: true,
          logo: true,
          _count: { select: { members: true, teams: true, leagues: true } },
        },
        orderBy: { members: { _count: "desc" } },
        take: 6,
      }),
    ]);

    return NextResponse.json({
      liveMatches,
      upcomingMatches,
      topPlayers,
      communities,
    });
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return NextResponse.json({
      liveMatches: [],
      upcomingMatches: [],
      topPlayers: [],
      communities: [],
    });
  }
}
