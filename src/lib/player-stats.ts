import { prisma } from "@/lib/prisma";

/**
 * Recalculate a player's aggregate stats from MatchEvent and MatchLineup records.
 * Call after submitting match events or completing a match.
 */
export async function recalcPlayerStats(playerId: string) {
  const [goalCount, assistCount, yellowCount, redCount, lineups] = await Promise.all([
    prisma.matchEvent.count({ where: { playerId, type: "GOAL" } }),
    prisma.matchEvent.count({ where: { playerId, type: "GOAL" } }),
    prisma.matchEvent.count({ where: { playerId, type: "YELLOW_CARD" } }),
    prisma.matchEvent.count({ where: { playerId, type: "RED_CARD" } }),
    prisma.matchLineup.findMany({
      where: { playerId },
      select: { rating: true },
    }),
  ]);

  const appearances = lineups.length;
  const ratedLineups = lineups.filter((l) => l.rating > 0);
  const averageRating =
    ratedLineups.length > 0
      ? ratedLineups.reduce((sum, l) => sum + l.rating, 0) / ratedLineups.length
      : 0;

  await prisma.player.update({
    where: { id: playerId },
    data: {
      goals: goalCount,
      assists: assistCount,
      yellowCards: yellowCount,
      redCards: redCount,
      appearances,
      averageRating: Math.round(averageRating * 100) / 100,
    },
  });
}

/**
 * Recalculate stats for ALL players involved in a given match.
 */
export async function recalcMatchPlayerStats(matchId: string) {
  const lineups = await prisma.matchLineup.findMany({
    where: { matchId },
    select: { playerId: true },
  });

  const events = await prisma.matchEvent.findMany({
    where: { matchId },
    select: { playerId: true, relatedPlayerId: true },
  });

  // Collect unique player IDs
  const playerIds = new Set<string>();
  lineups.forEach((l) => playerIds.add(l.playerId));
  events.forEach((e) => {
    playerIds.add(e.playerId);
    if (e.relatedPlayerId) playerIds.add(e.relatedPlayerId);
  });

  await Promise.all(
    Array.from(playerIds).map((pid) => recalcPlayerStats(pid))
  );
}
