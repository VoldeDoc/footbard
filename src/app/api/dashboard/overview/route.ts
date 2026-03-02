import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/session";

/**
 * GET /api/dashboard/overview
 *
 * Returns aggregated dashboard data from real database records:
 * - totalTeams, totalMatches, activeLeagues, totalGoals
 * - recentMatches (last 5 completed)
 * - topScorers (top 5 by goals)
 * - weeklyActivity (matches & goals per week for last 8 weeks)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const [
      totalTeams,
      totalMatches,
      activeLeagues,
      recentMatches,
      topScorers,
    ] = await Promise.all([
      prisma.team.count(),
      prisma.match.count({ where: { status: "COMPLETED" } }),
      prisma.league.count({ where: { isActive: true } }),
      prisma.match.findMany({
        where: { status: "COMPLETED" },
        include: {
          homeTeam: { select: { name: true, shortName: true, logo: true } },
          awayTeam: { select: { name: true, shortName: true, logo: true } },
        },
        orderBy: { matchDate: "desc" },
        take: 5,
      }),
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
        take: 5,
      }),
    ]);

    // Total goals from completed matches
    const goalAgg = await prisma.match.aggregate({
      where: { status: "COMPLETED" },
      _sum: { homeScore: true, awayScore: true },
    });
    const totalGoals = (goalAgg._sum.homeScore || 0) + (goalAgg._sum.awayScore || 0);

    // Weekly activity for last 8 weeks
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const completedMatches = await prisma.match.findMany({
      where: {
        status: "COMPLETED",
        matchDate: { gte: eightWeeksAgo },
      },
      select: { matchDate: true, homeScore: true, awayScore: true },
      orderBy: { matchDate: "asc" },
    });

    // Group by week
    const weekMap: Record<string, { matches: number; goals: number }> = {};
    for (const m of completedMatches) {
      const d = new Date(m.matchDate);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(d.setDate(diff));
      const key = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      if (!weekMap[key]) weekMap[key] = { matches: 0, goals: 0 };
      weekMap[key].matches++;
      weekMap[key].goals += m.homeScore + m.awayScore;
    }

    const weeklyActivity = Object.entries(weekMap)
      .slice(-8)
      .map(([name, data]) => ({ name, ...data }));

    // Matches this week for trend
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const matchesThisWeek = await prisma.match.count({
      where: { status: "COMPLETED", matchDate: { gte: oneWeekAgo } },
    });

    return NextResponse.json({
      totalTeams,
      totalMatches,
      activeLeagues,
      totalGoals,
      matchesThisWeek,
      recentMatches,
      topScorers,
      weeklyActivity,
    });
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
