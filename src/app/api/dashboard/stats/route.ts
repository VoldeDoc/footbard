import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized } from "@/lib/session";

/**
 * GET /api/dashboard/stats
 *
 * Returns comprehensive league statistics from real database records:
 * - totalGoals, totalAssists, totalYellowCards, totalRedCards
 * - topScorers (top 8)
 * - topAssists (top 8)
 * - highestRated (top 8 with > 0 rating)
 * - goalDistribution (first half vs second half from MatchEvent minutes)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const [
      goalAgg,
      assistAgg,
      yellowAgg,
      redAgg,
      topScorers,
      topAssists,
      highestRated,
      goalEvents,
    ] = await Promise.all([
      prisma.player.aggregate({ _sum: { goals: true } }),
      prisma.player.aggregate({ _sum: { assists: true } }),
      prisma.player.aggregate({ _sum: { yellowCards: true } }),
      prisma.player.aggregate({ _sum: { redCards: true } }),
      prisma.player.findMany({
        where: { goals: { gt: 0 } },
        select: {
          id: true,
          name: true,
          goals: true,
          team: { select: { name: true } },
        },
        orderBy: { goals: "desc" },
        take: 8,
      }),
      prisma.player.findMany({
        where: { assists: { gt: 0 } },
        select: {
          id: true,
          name: true,
          assists: true,
          team: { select: { name: true } },
        },
        orderBy: { assists: "desc" },
        take: 8,
      }),
      prisma.player.findMany({
        where: { averageRating: { gt: 0 }, appearances: { gt: 0 } },
        select: {
          id: true,
          name: true,
          averageRating: true,
          team: { select: { name: true } },
        },
        orderBy: { averageRating: "desc" },
        take: 8,
      }),
      // Goal events to calculate first/second half distribution
      prisma.matchEvent.findMany({
        where: { type: "GOAL" },
        select: { minute: true },
      }),
    ]);

    const totalGoals = goalAgg._sum?.goals || 0;
    const totalAssists = assistAgg._sum?.assists || 0;
    const totalYellowCards = yellowAgg._sum?.yellowCards || 0;
    const totalRedCards = redAgg._sum?.redCards || 0;

    // Goal distribution by half
    let firstHalf = 0;
    let secondHalf = 0;
    for (const e of goalEvents) {
      if (e.minute && e.minute <= 45) firstHalf++;
      else secondHalf++;
    }

    return NextResponse.json({
      totalGoals,
      totalAssists,
      totalYellowCards,
      totalRedCards,
      topScorers,
      topAssists,
      highestRated,
      goalDistribution: [
        { name: "First Half", value: firstHalf },
        { name: "Second Half", value: secondHalf },
      ],
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
