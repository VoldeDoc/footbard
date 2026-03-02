import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireRole } from "@/lib/session";

/**
 * GET /api/super-admin/analytics
 *
 * Platform-wide analytics for super admin dashboard.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const roleCheck = requireRole(user, "SUPER_ADMIN");
    if (roleCheck) return roleCheck;

    const [
      totalUsers,
      totalCommunities,
      suspendedCommunities,
      totalTeams,
      totalPlayers,
      totalLeagues,
      totalMatches,
      completedMatches,
      bannedUsers,
      roleCounts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.community.count(),
      prisma.community.count({ where: { isSuspended: true } }),
      prisma.team.count(),
      prisma.player.count({ where: { isBanned: false } }),
      prisma.league.count(),
      prisma.match.count(),
      prisma.match.count({ where: { status: "COMPLETED" } }),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    ]);

    // Recent activity: communities created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentCommunities, recentUsers, recentMatches] = await Promise.all([
      prisma.community.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.match.count({ where: { matchDate: { gte: thirtyDaysAgo }, status: "COMPLETED" } }),
    ]);

    // Total goals
    const goalAgg = await prisma.match.aggregate({
      where: { status: "COMPLETED" },
      _sum: { homeScore: true, awayScore: true },
    });
    const totalGoals = (goalAgg._sum.homeScore || 0) + (goalAgg._sum.awayScore || 0);

    // Top 5 largest communities
    const topCommunities = await prisma.community.findMany({
      select: {
        id: true,
        name: true,
        logo: true,
        isSuspended: true,
        _count: { select: { members: true, teams: true, leagues: true } },
      },
      orderBy: { members: { _count: "desc" } },
      take: 5,
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        totalCommunities,
        suspendedCommunities,
        totalTeams,
        totalPlayers,
        totalLeagues,
        totalMatches,
        completedMatches,
        totalGoals,
        bannedUsers,
      },
      roleCounts: roleCounts.reduce(
        (acc, r) => ({ ...acc, [r.role]: r._count._all }),
        {} as Record<string, number>
      ),
      recent: {
        communities: recentCommunities,
        users: recentUsers,
        matches: recentMatches,
      },
      topCommunities,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
