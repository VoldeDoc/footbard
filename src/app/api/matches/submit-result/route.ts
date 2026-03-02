import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, unauthorized, requireCommunityRole } from "@/lib/session";
import { updateStandings } from "@/lib/standings";
import { recalcMatchPlayerStats } from "@/lib/player-stats";

/**
 * POST /api/matches/submit-result
 *
 * Complete match result submission by community mod / admin.
 *
 * Body:
 *   matchId: string
 *   homeScore: number
 *   awayScore: number
 *   events: Array<{
 *     type: "GOAL" | "ASSIST" | "YELLOW_CARD" | "RED_CARD" | "SUBSTITUTION" | "SUB_IN" | "SUB_OUT"
 *     minute: number
 *     playerId: string
 *     relatedPlayerId?: string
 *     description?: string
 *   }>
 *   lineups: Array<{
 *     teamId: string
 *     playerId: string
 *     positionX: number
 *     positionY: number
 *     isStarter: boolean
 *     minutesPlayed: number
 *     rating: number
 *   }>
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await req.json();
    const { matchId, homeScore, awayScore, events, lineups } = body;

    // ── Validation ──────────────────────────────
    if (!matchId) {
      return NextResponse.json({ error: "matchId is required" }, { status: 400 });
    }

    if (homeScore === undefined || awayScore === undefined) {
      return NextResponse.json({ error: "homeScore and awayScore are required" }, { status: 400 });
    }

    if (homeScore < 0 || awayScore < 0) {
      return NextResponse.json({ error: "Scores cannot be negative" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { league: { select: { communityId: true } } },
    });
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // RBAC: must be community mod/admin for the league's community
    const roleCheck = await requireCommunityRole(user, match.league.communityId, "COMMUNITY_MOD", "ADMIN");
    if (roleCheck) return roleCheck;

    if (match.status === "COMPLETED") {
      return NextResponse.json({ error: "Match already completed" }, { status: 400 });
    }

    // Validate event goal count matches score
    if (events && Array.isArray(events)) {
      const goalEvents = events.filter((e: any) => e.type === "GOAL");
      // Fetch which team each goal-scorer belongs to
      const goalPlayerIds = goalEvents.map((e: any) => e.playerId);
      const goalPlayers = await prisma.player.findMany({
        where: { id: { in: goalPlayerIds } },
        select: { id: true, teamId: true },
      });
      const playerTeamMap = new Map(goalPlayers.map((p) => [p.id, p.teamId]));

      let homeGoals = 0;
      let awayGoals = 0;
      for (const e of goalEvents) {
        const teamId = playerTeamMap.get(e.playerId);
        if (teamId === match.homeTeamId) homeGoals++;
        else if (teamId === match.awayTeamId) awayGoals++;
      }

      if (homeGoals !== homeScore || awayGoals !== awayScore) {
        return NextResponse.json(
          {
            error: `Goal events don't match score. Events: ${homeGoals}-${awayGoals}, Score: ${homeScore}-${awayScore}`,
          },
          { status: 400 }
        );
      }

      // Validate all player IDs exist
      const allPlayerIds = new Set<string>();
      events.forEach((e: any) => {
        allPlayerIds.add(e.playerId);
        if (e.relatedPlayerId) allPlayerIds.add(e.relatedPlayerId);
      });
      const existingPlayers = await prisma.player.findMany({
        where: { id: { in: Array.from(allPlayerIds) } },
        select: { id: true },
      });
      const existingIds = new Set(existingPlayers.map((p) => p.id));
      for (const pid of allPlayerIds) {
        if (!existingIds.has(pid)) {
          return NextResponse.json({ error: `Player not found: ${pid}` }, { status: 400 });
        }
      }
    }

    // ── Step 1: Update match result ──────────────
    await prisma.match.update({
      where: { id: matchId },
      data: {
        homeScore,
        awayScore,
        status: "COMPLETED",
      },
    });

    // ── Step 2: Insert lineups ───────────────────
    if (lineups && Array.isArray(lineups) && lineups.length > 0) {
      // Remove existing lineups for this match
      await prisma.matchLineup.deleteMany({ where: { matchId } });

      await prisma.matchLineup.createMany({
        data: lineups.map((l: any) => ({
          matchId,
          teamId: l.teamId,
          playerId: l.playerId,
          positionX: l.positionX,
          positionY: l.positionY,
          isStarter: l.isStarter ?? true,
          minutesPlayed: l.minutesPlayed ?? 90,
          rating: l.rating ?? 0,
        })),
      });
    }

    // ── Step 3: Insert match events ──────────────
    if (events && Array.isArray(events) && events.length > 0) {
      // Remove existing events for this match
      await prisma.matchEvent.deleteMany({ where: { matchId } });

      await prisma.matchEvent.createMany({
        data: events.map((e: any) => ({
          matchId,
          type: e.type,
          minute: e.minute,
          playerId: e.playerId,
          relatedPlayerId: e.relatedPlayerId || null,
          description: e.description || null,
        })),
      });
    }

    // ── Step 4: Recalculate standings ─────────────
    await updateStandings(matchId);

    // ── Step 5: Recalculate player stats ─────────
    await recalcMatchPlayerStats(matchId);

    // Return the completed match with full data
    const completedMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true, logo: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, logo: true } },
        league: { select: { id: true, name: true } },
        events: {
          include: {
            player: { select: { id: true, name: true, jerseyNumber: true } },
            relatedPlayer: { select: { id: true, name: true, jerseyNumber: true } },
          },
          orderBy: { minute: "asc" },
        },
        lineups: {
          include: {
            player: { select: { id: true, name: true, jerseyNumber: true, position: true } },
          },
        },
      },
    });

    return NextResponse.json(completedMatch);
  } catch (error) {
    console.error("Error submitting match result:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
