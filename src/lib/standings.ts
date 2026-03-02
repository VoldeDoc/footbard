import { prisma } from "@/lib/prisma";

/**
 * Recalculate standings for a single match (incremental).
 * Called when a match is marked COMPLETED.
 */
export async function updateStandings(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match || match.status !== "COMPLETED") return;

  const homeWon = match.homeScore > match.awayScore;
  const awayWon = match.awayScore > match.homeScore;
  const draw = match.homeScore === match.awayScore;

  // Update home team standing
  await prisma.standing.upsert({
    where: {
      leagueId_teamId: {
        leagueId: match.leagueId,
        teamId: match.homeTeamId,
      },
    },
    create: {
      leagueId: match.leagueId,
      teamId: match.homeTeamId,
      played: 1,
      won: homeWon ? 1 : 0,
      drawn: draw ? 1 : 0,
      lost: awayWon ? 1 : 0,
      goalsFor: match.homeScore,
      goalsAgainst: match.awayScore,
      goalDifference: match.homeScore - match.awayScore,
      points: homeWon ? 3 : draw ? 1 : 0,
    },
    update: {
      played: { increment: 1 },
      won: { increment: homeWon ? 1 : 0 },
      drawn: { increment: draw ? 1 : 0 },
      lost: { increment: awayWon ? 1 : 0 },
      goalsFor: { increment: match.homeScore },
      goalsAgainst: { increment: match.awayScore },
      goalDifference: { increment: match.homeScore - match.awayScore },
      points: { increment: homeWon ? 3 : draw ? 1 : 0 },
    },
  });

  // Update away team standing
  await prisma.standing.upsert({
    where: {
      leagueId_teamId: {
        leagueId: match.leagueId,
        teamId: match.awayTeamId,
      },
    },
    create: {
      leagueId: match.leagueId,
      teamId: match.awayTeamId,
      played: 1,
      won: awayWon ? 1 : 0,
      drawn: draw ? 1 : 0,
      lost: homeWon ? 1 : 0,
      goalsFor: match.awayScore,
      goalsAgainst: match.homeScore,
      goalDifference: match.awayScore - match.homeScore,
      points: awayWon ? 3 : draw ? 1 : 0,
    },
    update: {
      played: { increment: 1 },
      won: { increment: awayWon ? 1 : 0 },
      drawn: { increment: draw ? 1 : 0 },
      lost: { increment: homeWon ? 1 : 0 },
      goalsFor: { increment: match.awayScore },
      goalsAgainst: { increment: match.homeScore },
      goalDifference: { increment: match.awayScore - match.homeScore },
      points: { increment: awayWon ? 3 : draw ? 1 : 0 },
    },
  });
}

/**
 * Full recalculation of all standings for a competition from scratch.
 * Deletes existing standings and rebuilds from all COMPLETED matches.
 * Use this for data corrections or bulk recalculation.
 */
export async function recalcStandings(leagueId: string) {
  // Delete existing standings for this league
  await prisma.standing.deleteMany({ where: { leagueId } });

  // Fetch all completed matches
  const matches = await prisma.match.findMany({
    where: { leagueId, status: "COMPLETED" },
  });

  // Build standings map
  const map: Record<
    string,
    { played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number }
  > = {};

  const ensure = (teamId: string) => {
    if (!map[teamId]) {
      map[teamId] = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 };
    }
  };

  for (const m of matches) {
    ensure(m.homeTeamId);
    ensure(m.awayTeamId);

    const home = map[m.homeTeamId];
    const away = map[m.awayTeamId];

    home.played++;
    away.played++;
    home.goalsFor += m.homeScore;
    home.goalsAgainst += m.awayScore;
    away.goalsFor += m.awayScore;
    away.goalsAgainst += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.won++;
      away.lost++;
    } else if (m.awayScore > m.homeScore) {
      away.won++;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
    }
  }

  // Insert computed standings
  const creates = Object.entries(map).map(([teamId, s]) =>
    prisma.standing.create({
      data: {
        leagueId,
        teamId,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDifference: s.goalsFor - s.goalsAgainst,
        points: s.won * 3 + s.drawn,
      },
    })
  );

  await Promise.all(creates);
}
