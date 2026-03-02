import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding demo data...");

  // ─── DEMO USER ────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("demo123", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: { role: "COMMUNITY_MOD" },
    create: {
      name: "Demo User",
      email: "demo@example.com",
      password: hashedPassword,
      role: "COMMUNITY_MOD",
    },
  });
  console.log("✅ Demo user created:", demoUser.email);

  // ─── COMMUNITY ────────────────────────────────────────────────
  const community = await prisma.community.upsert({
    where: { slug: "pitchsync-demo-league" },
    update: {},
    create: {
      name: "PitchSync Demo League",
      slug: "pitchsync-demo-league",
      description: "A fully loaded demo community showcasing all features of PitchSync.",
      createdById: demoUser.id,
    },
  });

  // Ensure demo user is a COMMUNITY_MOD member
  await prisma.communityMember.upsert({
    where: { userId_communityId: { userId: demoUser.id, communityId: community.id } },
    update: { role: "COMMUNITY_MOD" },
    create: { userId: demoUser.id, communityId: community.id, role: "COMMUNITY_MOD" },
  });
  console.log("✅ Community created:", community.name);

  // ─── TEAMS ────────────────────────────────────────────────────
  const teamsData = [
    { name: "Thunder FC", shortName: "THU" },
    { name: "Lightning United", shortName: "LIG" },
    { name: "Storm City", shortName: "STO" },
    { name: "Blaze Athletic", shortName: "BLA" },
  ];

  for (const t of teamsData) {
    const existing = await prisma.team.findFirst({ where: { name: t.name, communityId: community.id } });
    if (!existing) {
      await prisma.team.create({ data: { name: t.name, shortName: t.shortName, communityId: community.id } });
    }
  }
  // Re-fetch all teams in this community to make sure we have them
  const allTeams = await prisma.team.findMany({ where: { communityId: community.id } });
  const [teamA, teamB, teamC, teamD] = allTeams;
  console.log(`✅ ${allTeams.length} teams ready`);

  // ─── PLAYERS ─────────────────────────────────────────────────
  const positions = ["GK", "CB", "CB", "LB", "RB", "CDM", "CM", "CM", "LW", "RW", "ST"];
  const firstNames = ["James", "Carlos", "Marcus", "Oliver", "Kai", "Liam", "Noah", "Ethan", "Mason", "Lucas", "Aiden", "Logan", "Ryan", "Dylan", "Tyler"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Davis", "Wilson", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin"];

  async function seedPlayers(team: typeof teamA, offset: number) {
    if (!team) return;
    for (let i = 0; i < 11; i++) {
      const name = `${firstNames[(i + offset) % firstNames.length]} ${lastNames[(i + offset) % lastNames.length]}`;
      const existing = await prisma.player.findFirst({ where: { name, teamId: team.id } });
      if (!existing) {
        await prisma.player.create({
          data: {
            name,
            position: positions[i],
            shirtNumber: i + 1,
            teamId: team.id,
            goals: Math.floor(Math.random() * 12),
            assists: Math.floor(Math.random() * 8),
            appearances: Math.floor(Math.random() * 15) + 5,
            yellowCards: Math.floor(Math.random() * 3),
            redCards: Math.random() > 0.9 ? 1 : 0,
            age: Math.floor(Math.random() * 12) + 18,
          },
        });
      }
    }
  }

  await seedPlayers(teamA, 0);
  await seedPlayers(teamB, 11);
  await seedPlayers(teamC, 5);
  await seedPlayers(teamD, 8);
  console.log("✅ Players seeded");

  // ─── LEAGUE ───────────────────────────────────────────────────
  let league = await prisma.league.findFirst({ where: { communityId: community.id } });
  if (!league) {
    league = await prisma.league.create({
      data: {
        name: "Demo Premier League",
        season: "2025/26",
        communityId: community.id,
        isActive: true,
        startDate: new Date("2025-09-01"),
        endDate: new Date("2026-05-31"),
      },
    });
  }

  // Add all 4 teams to the league
  for (const t of allTeams) {
    await prisma.leagueTeam.upsert({
      where: { leagueId_teamId: { leagueId: league.id, teamId: t.id } },
      update: {},
      create: { leagueId: league.id, teamId: t.id },
    });
  }
  console.log("✅ League created and teams enrolled");

  // ─── MATCHES ──────────────────────────────────────────────────
  interface MatchSetup {
    homeTeam: typeof teamA;
    awayTeam: typeof teamA;
    homeScore: number;
    awayScore: number;
    date: Date;
    status: "COMPLETED" | "SCHEDULED";
  }
  const matchSetups: MatchSetup[] = [
    { homeTeam: teamA, awayTeam: teamB, homeScore: 3, awayScore: 1, date: new Date("2026-01-10"), status: "COMPLETED" },
    { homeTeam: teamC, awayTeam: teamD, homeScore: 2, awayScore: 2, date: new Date("2026-01-10"), status: "COMPLETED" },
    { homeTeam: teamB, awayTeam: teamC, homeScore: 1, awayScore: 0, date: new Date("2026-01-17"), status: "COMPLETED" },
    { homeTeam: teamD, awayTeam: teamA, homeScore: 0, awayScore: 2, date: new Date("2026-01-17"), status: "COMPLETED" },
    { homeTeam: teamA, awayTeam: teamC, homeScore: 4, awayScore: 1, date: new Date("2026-01-24"), status: "COMPLETED" },
    { homeTeam: teamB, awayTeam: teamD, homeScore: 2, awayScore: 3, date: new Date("2026-01-24"), status: "COMPLETED" },
    { homeTeam: teamC, awayTeam: teamA, homeScore: 1, awayScore: 1, date: new Date("2026-02-07"), status: "COMPLETED" },
    { homeTeam: teamD, awayTeam: teamB, homeScore: 2, awayScore: 0, date: new Date("2026-02-07"), status: "COMPLETED" },
    { homeTeam: teamA, awayTeam: teamD, homeScore: 0, awayScore: 0, date: new Date("2026-03-10"), status: "SCHEDULED" },
    { homeTeam: teamB, awayTeam: teamC, homeScore: 0, awayScore: 0, date: new Date("2026-03-10"), status: "SCHEDULED" },
  ];

  const createdMatches = [];
  for (const m of matchSetups) {
    if (!m.homeTeam || !m.awayTeam) continue;
    const existing = await prisma.match.findFirst({
      where: { homeTeamId: m.homeTeam.id, awayTeamId: m.awayTeam.id, leagueId: league.id },
    });
    if (!existing) {
      const match = await prisma.match.create({
        data: {
          leagueId: league.id,
          homeTeamId: m.homeTeam.id,
          awayTeamId: m.awayTeam.id,
          matchDate: m.date,
          status: m.status,
          homeScore: m.status === "COMPLETED" ? m.homeScore : 0,
          awayScore: m.status === "COMPLETED" ? m.awayScore : 0,
          venue: "Demo Stadium",
        },
      });
      createdMatches.push({ match, setup: m });
    }
  }
  console.log(`✅ ${createdMatches.length} matches created`);

  // ─── MATCH EVENTS ─────────────────────────────────────────────
  for (const { match, setup } of createdMatches) {
    if (setup.status !== "COMPLETED") continue;
    const homePlayers = await prisma.player.findMany({ where: { teamId: setup.homeTeam.id }, take: 5 });
    const awayPlayers = await prisma.player.findMany({ where: { teamId: setup.awayTeam.id }, take: 5 });
    const events = [];
    let homeGoalsLeft = setup.homeScore;
    let awayGoalsLeft = setup.awayScore;
    let minute = 10;
    while (homeGoalsLeft > 0 || awayGoalsLeft > 0) {
      if (homeGoalsLeft > 0 && homePlayers.length > 0) {
        const scorer = homePlayers[Math.floor(Math.random() * homePlayers.length)];
        const assistant = homePlayers.find((p) => p.id !== scorer.id);
        events.push({
          matchId: match.id,
          playerId: scorer.id,
          type: "GOAL" as const,
          minute,
          relatedPlayerId: assistant?.id ?? null,
        });
        homeGoalsLeft--;
        minute += Math.floor(Math.random() * 15) + 5;
      }
      if (awayGoalsLeft > 0 && awayPlayers.length > 0) {
        const scorer = awayPlayers[Math.floor(Math.random() * awayPlayers.length)];
        const assistant = awayPlayers.find((p) => p.id !== scorer.id);
        events.push({
          matchId: match.id,
          playerId: scorer.id,
          type: "GOAL" as const,
          minute,
          relatedPlayerId: assistant?.id ?? null,
        });
        awayGoalsLeft--;
        minute += Math.floor(Math.random() * 10) + 5;
      }
    }
    // Add a yellow card
    const yellowTarget = homePlayers[2] || awayPlayers[2];
    if (yellowTarget) {
      events.push({ matchId: match.id, playerId: yellowTarget.id, type: "YELLOW_CARD" as const, minute: 55, relatedPlayerId: null });
    }
    if (events.length > 0) {
      await prisma.matchEvent.createMany({ data: events, skipDuplicates: true });
    }
  }
  console.log("✅ Match events seeded");

  // ─── LINEUPS ──────────────────────────────────────────────────
  for (const { match, setup } of createdMatches) {
    if (setup.status !== "COMPLETED") continue;
    const homePlayers = await prisma.player.findMany({ where: { teamId: setup.homeTeam.id }, take: 11 });
    const awayPlayers = await prisma.player.findMany({ where: { teamId: setup.awayTeam.id }, take: 11 });
    const lineupData = [
      ...homePlayers.map((p, i) => ({ matchId: match.id, playerId: p.id, isStarter: true, minutesPlayed: 90, rating: parseFloat((Math.random() * 3 + 5).toFixed(1)), position: positions[i] ?? "MF" })),
      ...awayPlayers.map((p, i) => ({ matchId: match.id, playerId: p.id, isStarter: true, minutesPlayed: 90, rating: parseFloat((Math.random() * 3 + 5).toFixed(1)), position: positions[i] ?? "MF" })),
    ];
    await prisma.matchLineup.createMany({ data: lineupData, skipDuplicates: true });
  }
  console.log("✅ Lineups seeded");

  // ─── STANDINGS ────────────────────────────────────────────────
  // Calculate from match results
  const standingsMap: Record<string, { played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; goalDifference: number; points: number }> = {};
  for (const t of allTeams) {
    standingsMap[t.id] = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };
  }
  const allMatches = await prisma.match.findMany({ where: { leagueId: league.id, status: "COMPLETED" } });
  for (const m of allMatches) {
    const h = standingsMap[m.homeTeamId];
    const a = standingsMap[m.awayTeamId];
    if (!h || !a) continue;
    h.played++; a.played++;
    h.goalsFor += m.homeScore; h.goalsAgainst += m.awayScore;
    a.goalsFor += m.awayScore; a.goalsAgainst += m.homeScore;
    if (m.homeScore > m.awayScore) { h.won++; h.points += 3; a.lost++; }
    else if (m.homeScore < m.awayScore) { a.won++; a.points += 3; h.lost++; }
    else { h.drawn++; a.drawn++; h.points++; a.points++; }
  }
  for (const [teamId, s] of Object.entries(standingsMap)) {
    await prisma.standing.upsert({
      where: { leagueId_teamId: { leagueId: league.id, teamId } },
      update: { ...s, goalDifference: s.goalsFor - s.goalsAgainst },
      create: { leagueId: league.id, teamId, ...s, goalDifference: s.goalsFor - s.goalsAgainst },
    });
  }
  console.log("✅ Standings calculated and saved");

  // ─── UPDATE PLAYER GOALS FROM EVENTS ──────────────────────────
  const goalEvents = await prisma.matchEvent.findMany({ where: { type: "GOAL" } });
  const goalsPerPlayer: Record<string, number> = {};
  const assistsPerPlayer: Record<string, number> = {};
  for (const e of goalEvents) {
    goalsPerPlayer[e.playerId] = (goalsPerPlayer[e.playerId] || 0) + 1;
    if (e.relatedPlayerId) {
      assistsPerPlayer[e.relatedPlayerId] = (assistsPerPlayer[e.relatedPlayerId] || 0) + 1;
    }
  }
  for (const [playerId, goals] of Object.entries(goalsPerPlayer)) {
    await prisma.player.update({ where: { id: playerId }, data: { goals } });
  }
  for (const [playerId, assists] of Object.entries(assistsPerPlayer)) {
    await prisma.player.update({ where: { id: playerId }, data: { assists } });
  }
  console.log("✅ Player stats updated from events");

  // ─── ANNOUNCEMENT ─────────────────────────────────────────────
  const ann = await prisma.announcement.findFirst({ where: { communityId: community.id } });
  if (!ann) {
    await prisma.announcement.create({
      data: {
        title: "Welcome to PitchSync Demo!",
        content: "This is a fully loaded demo with 4 teams, 44 players, 8 completed matches, live standings, and full match events. Explore every feature!",
        communityId: community.id,
        authorRole: "ADMIN",
      },
    });
  }
  console.log("✅ Announcement created");

  console.log("\n🎉 Demo seed complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Email:    demo@example.com");
  console.log("  Password: demo123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
