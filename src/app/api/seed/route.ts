import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * GET /api/seed?secret=pitchsync-demo
 * One-time endpoint to seed demo data. Safe to call multiple times (idempotent).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== "pitchsync-demo") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // ── DEMO USER ────────────────────────────────────────────────
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

    // ── COMMUNITY ────────────────────────────────────────────────
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

    await prisma.communityMember.upsert({
      where: { userId_communityId: { userId: demoUser.id, communityId: community.id } },
      update: { role: "COMMUNITY_MOD" },
      create: { userId: demoUser.id, communityId: community.id, role: "COMMUNITY_MOD" },
    });

    // Early exit if teams already exist (already seeded)
    const existingTeams = await prisma.team.findMany({ where: { communityId: community.id } });
    if (existingTeams.length >= 4) {
      return NextResponse.json({
        ok: true,
        message: "Demo data already exists",
        login: { email: "demo@example.com", password: "demo123" },
      });
    }

    // ── TEAMS ────────────────────────────────────────────────────
    const teamsData = [
      { name: "Thunder FC", shortName: "THU" },
      { name: "Lightning United", shortName: "LIG" },
      { name: "Storm City", shortName: "STO" },
      { name: "Blaze Athletic", shortName: "BLA" },
    ];

    for (const t of teamsData) {
      const ex = await prisma.team.findFirst({ where: { name: t.name, communityId: community.id } });
      if (!ex) {
        await prisma.team.create({ data: { name: t.name, shortName: t.shortName, communityId: community.id } });
      }
    }

    const allTeams = await prisma.team.findMany({ where: { communityId: community.id } });
    const [teamA, teamB, teamC, teamD] = allTeams;

    // ── PLAYERS ──────────────────────────────────────────────────
    const positions = ["GK", "CB", "CB", "LB", "RB", "CDM", "CM", "CM", "LW", "RW", "ST"];
    const firstNames = ["James", "Carlos", "Marcus", "Oliver", "Kai", "Liam", "Noah", "Ethan", "Mason", "Lucas", "Aiden"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Davis", "Wilson", "Taylor", "Anderson", "Thomas"];

    async function seedPlayers(team: typeof teamA, offset: number) {
      if (!team) return;
      for (let i = 0; i < 11; i++) {
        const name = `${firstNames[(i + offset) % firstNames.length]} ${lastNames[(i + offset) % lastNames.length]}`;
        const ex = await prisma.player.findFirst({ where: { name, teamId: team.id } });
        if (!ex) {
          await prisma.player.create({
            data: {
              name,
              position: positions[i],
              shirtNumber: i + 1,
              teamId: team.id,
              age: Math.floor(Math.random() * 12) + 18,
            },
          });
        }
      }
    }

    await seedPlayers(teamA, 0);
    await seedPlayers(teamB, 3);
    await seedPlayers(teamC, 6);
    await seedPlayers(teamD, 9);

    // ── LEAGUE ───────────────────────────────────────────────────
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

    for (const t of allTeams) {
      await prisma.leagueTeam.upsert({
        where: { leagueId_teamId: { leagueId: league.id, teamId: t.id } },
        update: {},
        create: { leagueId: league.id, teamId: t.id },
      });
    }

    // ── MATCHES ──────────────────────────────────────────────────
    type MatchSetup = {
      home: typeof teamA;
      away: typeof teamA;
      hs: number;
      as: number;
      date: string;
      status: "COMPLETED" | "SCHEDULED";
    };

    const matchSetups: MatchSetup[] = [
      { home: teamA, away: teamB, hs: 3, as: 1, date: "2026-01-10", status: "COMPLETED" },
      { home: teamC, away: teamD, hs: 2, as: 2, date: "2026-01-10", status: "COMPLETED" },
      { home: teamB, away: teamC, hs: 1, as: 0, date: "2026-01-17", status: "COMPLETED" },
      { home: teamD, away: teamA, hs: 0, as: 2, date: "2026-01-17", status: "COMPLETED" },
      { home: teamA, away: teamC, hs: 4, as: 1, date: "2026-01-24", status: "COMPLETED" },
      { home: teamB, away: teamD, hs: 2, as: 3, date: "2026-01-24", status: "COMPLETED" },
      { home: teamC, away: teamA, hs: 1, as: 1, date: "2026-02-07", status: "COMPLETED" },
      { home: teamD, away: teamB, hs: 2, as: 0, date: "2026-02-07", status: "COMPLETED" },
      { home: teamA, away: teamD, hs: 0, as: 0, date: "2026-03-10", status: "SCHEDULED" },
      { home: teamB, away: teamC, hs: 0, as: 0, date: "2026-03-10", status: "SCHEDULED" },
    ];

    const createdMatches: { match: { id: string }, setup: MatchSetup }[] = [];
    for (const m of matchSetups) {
      if (!m.home || !m.away) continue;
      const ex = await prisma.match.findFirst({
        where: { homeTeamId: m.home.id, awayTeamId: m.away.id, leagueId: league.id },
      });
      if (!ex) {
        const match = await prisma.match.create({
          data: {
            leagueId: league.id,
            homeTeamId: m.home.id,
            awayTeamId: m.away.id,
            matchDate: new Date(m.date),
            status: m.status,
            homeScore: m.status === "COMPLETED" ? m.hs : 0,
            awayScore: m.status === "COMPLETED" ? m.as : 0,
            venue: "Demo Stadium",
          },
        });
        createdMatches.push({ match, setup: m });
      }
    }

    // ── MATCH EVENTS & LINEUPS ────────────────────────────────────
    for (const { match, setup } of createdMatches) {
      if (setup.status !== "COMPLETED") continue;
      const homePlayers = await prisma.player.findMany({ where: { teamId: setup.home.id }, take: 11 });
      const awayPlayers = await prisma.player.findMany({ where: { teamId: setup.away.id }, take: 11 });

      // Lineups
      const lineupData = [
        ...homePlayers.map((p, i) => ({ matchId: match.id, playerId: p.id, isStarter: true, minutesPlayed: 90, rating: parseFloat((Math.random() * 3 + 5).toFixed(1)), position: positions[i] ?? "MF" })),
        ...awayPlayers.map((p, i) => ({ matchId: match.id, playerId: p.id, isStarter: true, minutesPlayed: 90, rating: parseFloat((Math.random() * 3 + 5).toFixed(1)), position: positions[i] ?? "MF" })),
      ];
      await prisma.matchLineup.createMany({ data: lineupData, skipDuplicates: true });

      // Events
      let homeGoals = setup.hs;
      let awayGoals = setup.as;
      let minute = 8;
      const events: { matchId: string; playerId: string; type: "GOAL" | "YELLOW_CARD"; minute: number; relatedPlayerId: string | null }[] = [];

      while (homeGoals > 0 && homePlayers.length > 0) {
        const scorer = homePlayers[homeGoals % homePlayers.length];
        const assist = homePlayers[(homeGoals + 1) % homePlayers.length];
        events.push({ matchId: match.id, playerId: scorer.id, type: "GOAL", minute, relatedPlayerId: assist.id });
        homeGoals--;
        minute += 12;
      }
      while (awayGoals > 0 && awayPlayers.length > 0) {
        const scorer = awayPlayers[awayGoals % awayPlayers.length];
        const assist = awayPlayers[(awayGoals + 1) % awayPlayers.length];
        events.push({ matchId: match.id, playerId: scorer.id, type: "GOAL", minute, relatedPlayerId: assist.id });
        awayGoals--;
        minute += 12;
      }
      if (homePlayers[3]) {
        events.push({ matchId: match.id, playerId: homePlayers[3].id, type: "YELLOW_CARD", minute: 55, relatedPlayerId: null });
      }
      if (events.length > 0) {
        await prisma.matchEvent.createMany({ data: events, skipDuplicates: true });
      }
    }

    // ── STANDINGS ─────────────────────────────────────────────────
    const allMatches = await prisma.match.findMany({ where: { leagueId: league.id, status: "COMPLETED" } });
    const sm: Record<string, { played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; goalDifference: number; points: number }> = {};
    for (const t of allTeams) {
      sm[t.id] = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };
    }
    for (const m of allMatches) {
      const h = sm[m.homeTeamId]; const a = sm[m.awayTeamId];
      if (!h || !a) continue;
      h.played++; a.played++;
      h.goalsFor += m.homeScore; h.goalsAgainst += m.awayScore;
      a.goalsFor += m.awayScore; a.goalsAgainst += m.homeScore;
      if (m.homeScore > m.awayScore) { h.won++; h.points += 3; a.lost++; }
      else if (m.homeScore < m.awayScore) { a.won++; a.points += 3; h.lost++; }
      else { h.drawn++; a.drawn++; h.points++; a.points++; }
    }
    for (const [teamId, s] of Object.entries(sm)) {
      await prisma.standing.upsert({
        where: { leagueId_teamId: { leagueId: league.id, teamId } },
        update: { ...s, goalDifference: s.goalsFor - s.goalsAgainst },
        create: { leagueId: league.id, teamId, ...s, goalDifference: s.goalsFor - s.goalsAgainst },
      });
    }

    // Update player goals/assists from events
    const goalEvents = await prisma.matchEvent.findMany({ where: { type: "GOAL" } });
    const goalsMap: Record<string, number> = {};
    const assistsMap: Record<string, number> = {};
    for (const e of goalEvents) {
      goalsMap[e.playerId] = (goalsMap[e.playerId] || 0) + 1;
      if (e.relatedPlayerId) assistsMap[e.relatedPlayerId] = (assistsMap[e.relatedPlayerId] || 0) + 1;
    }
    for (const [playerId, goals] of Object.entries(goalsMap)) {
      await prisma.player.update({ where: { id: playerId }, data: { goals, appearances: 8 } });
    }
    for (const [playerId, assists] of Object.entries(assistsMap)) {
      await prisma.player.update({ where: { id: playerId }, data: { assists } });
    }

    // ── ANNOUNCEMENT ─────────────────────────────────────────────
    const ann = await prisma.announcement.findFirst({ where: { communityId: community.id } });
    if (!ann) {
      await prisma.announcement.create({
        data: {
          title: "Welcome to PitchSync Demo!",
          content: "This is a fully loaded demo with 4 teams, 44 players, 8 completed matches, live standings, and full match events. Log in with demo@example.com / demo123 to explore every feature!",
          communityId: community.id,
          authorRole: "ADMIN",
        },
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Demo data seeded successfully!",
      summary: {
        teams: allTeams.length,
        matches: createdMatches.length,
        league: league.name,
      },
      login: { email: "demo@example.com", password: "demo123" },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed", details: String(error) }, { status: 500 });
  }
}
