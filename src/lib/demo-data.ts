/**
 * DEMO DATA — all hardcoded, zero DB calls.
 * Used when user.email === "demo@example.com"
 */

export const DEMO_USER = {
  id: "demo-user-001",
  name: "Demo User",
  email: "demo@example.com",
  role: "COMMUNITY_MOD",
  image: null,
};

export const DEMO_COMMUNITY = {
  id: "demo-community-001",
  name: "PitchSync Demo League",
  slug: "pitchsync-demo-league",
  description: "A fully loaded demo community showcasing all features of PitchSync. 4 teams · 44 players · 8 completed matches · live standings.",
  logo: null,
  banner: null,
  isSuspended: false,
  createdById: "demo-user-001",
  createdAt: "2025-09-01T00:00:00.000Z",
  _count: { members: 12, teams: 4, leagues: 1 },
};

export const DEMO_TEAMS = [
  { id: "demo-team-001", name: "Thunder FC",       shortName: "THU", logo: null, communityId: "demo-community-001", _count: { players: 11 }, community: { id: "demo-community-001", name: "PitchSync Demo League" } },
  { id: "demo-team-002", name: "Lightning United", shortName: "LIG", logo: null, communityId: "demo-community-001", _count: { players: 11 }, community: { id: "demo-community-001", name: "PitchSync Demo League" } },
  { id: "demo-team-003", name: "Storm City",       shortName: "STO", logo: null, communityId: "demo-community-001", _count: { players: 11 }, community: { id: "demo-community-001", name: "PitchSync Demo League" } },
  { id: "demo-team-004", name: "Blaze Athletic",   shortName: "BLA", logo: null, communityId: "demo-community-001", _count: { players: 11 }, community: { id: "demo-community-001", name: "PitchSync Demo League" } },
];

export const DEMO_PLAYERS = [
  // Thunder FC
  { id: "p-001", name: "James Smith",    position: "GK",  shirtNumber: 1,  teamId: "demo-team-001", age: 28, goals: 0,  assists: 0, appearances: 8, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-001", name: "Thunder FC",       shortName: "THU" } },
  { id: "p-002", name: "Carlos Johnson", position: "CB",  shirtNumber: 5,  teamId: "demo-team-001", age: 25, goals: 1,  assists: 0, appearances: 8, yellowCards: 1, redCards: 0, isBanned: false, team: { id: "demo-team-001", name: "Thunder FC",       shortName: "THU" } },
  { id: "p-003", name: "Marcus Williams",position: "CB",  shirtNumber: 6,  teamId: "demo-team-001", age: 27, goals: 0,  assists: 1, appearances: 7, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-001", name: "Thunder FC",       shortName: "THU" } },
  { id: "p-004", name: "Oliver Brown",   position: "LB",  shirtNumber: 3,  teamId: "demo-team-001", age: 22, goals: 0,  assists: 2, appearances: 8, yellowCards: 1, redCards: 0, isBanned: false, team: { id: "demo-team-001", name: "Thunder FC",       shortName: "THU" } },
  { id: "p-005", name: "Kai Jones",      position: "RB",  shirtNumber: 2,  teamId: "demo-team-001", age: 24, goals: 1,  assists: 1, appearances: 8, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-001", name: "Thunder FC",       shortName: "THU" } },
  { id: "p-006", name: "Liam Garcia",    position: "CDM", shirtNumber: 4,  teamId: "demo-team-001", age: 26, goals: 2,  assists: 3, appearances: 8, yellowCards: 2, redCards: 0, isBanned: false, team: { id: "demo-team-001", name: "Thunder FC",       shortName: "THU" } },
  { id: "p-007", name: "Noah Davis",     position: "CM",  shirtNumber: 8,  teamId: "demo-team-001", age: 23, goals: 3,  assists: 4, appearances: 8, yellowCards: 1, redCards: 0, isBanned: false, team: { id: "demo-team-001", name: "Thunder FC",       shortName: "THU" } },
  { id: "p-008", name: "Ethan Wilson",   position: "CM",  shirtNumber: 10, teamId: "demo-team-001", age: 26, goals: 4,  assists: 2, appearances: 8, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-001", name: "Thunder FC",       shortName: "THU" } },
  { id: "p-009", name: "Mason Taylor",   position: "LW",  shirtNumber: 11, teamId: "demo-team-001", age: 21, goals: 5,  assists: 3, appearances: 8, yellowCards: 1, redCards: 0, isBanned: false, team: { id: "demo-team-001", name: "Thunder FC",       shortName: "THU" } },
  { id: "p-010", name: "Lucas Anderson", position: "RW",  shirtNumber: 7,  teamId: "demo-team-001", age: 23, goals: 6,  assists: 2, appearances: 8, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-001", name: "Thunder FC",       shortName: "THU" } },
  { id: "p-011", name: "Aiden Thomas",   position: "ST",  shirtNumber: 9,  teamId: "demo-team-001", age: 25, goals: 9,  assists: 1, appearances: 8, yellowCards: 1, redCards: 0, isBanned: false, team: { id: "demo-team-001", name: "Thunder FC",       shortName: "THU" } },
  // Lightning United
  { id: "p-012", name: "Logan Jackson",  position: "GK",  shirtNumber: 1,  teamId: "demo-team-002", age: 29, goals: 0,  assists: 0, appearances: 8, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-002", name: "Lightning United", shortName: "LIG" } },
  { id: "p-013", name: "Ryan White",     position: "CB",  shirtNumber: 4,  teamId: "demo-team-002", age: 26, goals: 1,  assists: 1, appearances: 8, yellowCards: 1, redCards: 0, isBanned: false, team: { id: "demo-team-002", name: "Lightning United", shortName: "LIG" } },
  { id: "p-014", name: "Dylan Harris",   position: "CB",  shirtNumber: 5,  teamId: "demo-team-002", age: 24, goals: 0,  assists: 0, appearances: 7, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-002", name: "Lightning United", shortName: "LIG" } },
  { id: "p-015", name: "Tyler Martin",   position: "LB",  shirtNumber: 3,  teamId: "demo-team-002", age: 22, goals: 0,  assists: 2, appearances: 8, yellowCards: 2, redCards: 0, isBanned: false, team: { id: "demo-team-002", name: "Lightning United", shortName: "LIG" } },
  { id: "p-016", name: "James Lee",      position: "RB",  shirtNumber: 2,  teamId: "demo-team-002", age: 25, goals: 1,  assists: 0, appearances: 8, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-002", name: "Lightning United", shortName: "LIG" } },
  { id: "p-017", name: "Carlos Moore",   position: "CDM", shirtNumber: 6,  teamId: "demo-team-002", age: 27, goals: 2,  assists: 1, appearances: 8, yellowCards: 1, redCards: 0, isBanned: false, team: { id: "demo-team-002", name: "Lightning United", shortName: "LIG" } },
  { id: "p-018", name: "Marcus Taylor",  position: "CM",  shirtNumber: 8,  teamId: "demo-team-002", age: 23, goals: 3,  assists: 3, appearances: 8, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-002", name: "Lightning United", shortName: "LIG" } },
  { id: "p-019", name: "Oliver Clark",   position: "CM",  shirtNumber: 10, teamId: "demo-team-002", age: 25, goals: 2,  assists: 4, appearances: 8, yellowCards: 1, redCards: 0, isBanned: false, team: { id: "demo-team-002", name: "Lightning United", shortName: "LIG" } },
  { id: "p-020", name: "Kai Lewis",      position: "LW",  shirtNumber: 11, teamId: "demo-team-002", age: 21, goals: 4,  assists: 2, appearances: 8, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-002", name: "Lightning United", shortName: "LIG" } },
  { id: "p-021", name: "Liam Robinson",  position: "RW",  shirtNumber: 7,  teamId: "demo-team-002", age: 24, goals: 3,  assists: 1, appearances: 8, yellowCards: 1, redCards: 0, isBanned: false, team: { id: "demo-team-002", name: "Lightning United", shortName: "LIG" } },
  { id: "p-022", name: "Noah Walker",    position: "ST",  shirtNumber: 9,  teamId: "demo-team-002", age: 26, goals: 7,  assists: 0, appearances: 8, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-002", name: "Lightning United", shortName: "LIG" } },
  // Storm City
  { id: "p-023", name: "Ethan Hall",     position: "GK",  shirtNumber: 1,  teamId: "demo-team-003", age: 30, goals: 0,  assists: 0, appearances: 8, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-003", name: "Storm City",       shortName: "STO" } },
  { id: "p-024", name: "Mason Allen",    position: "CB",  shirtNumber: 5,  teamId: "demo-team-003", age: 26, goals: 1,  assists: 0, appearances: 8, yellowCards: 1, redCards: 0, isBanned: false, team: { id: "demo-team-003", name: "Storm City",       shortName: "STO" } },
  { id: "p-025", name: "Lucas Young",    position: "CB",  shirtNumber: 6,  teamId: "demo-team-003", age: 25, goals: 0,  assists: 1, appearances: 7, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-003", name: "Storm City",       shortName: "STO" } },
  { id: "p-026", name: "Aiden King",     position: "LB",  shirtNumber: 3,  teamId: "demo-team-003", age: 22, goals: 0,  assists: 1, appearances: 8, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-003", name: "Storm City",       shortName: "STO" } },
  { id: "p-027", name: "Logan Wright",   position: "RB",  shirtNumber: 2,  teamId: "demo-team-003", age: 23, goals: 1,  assists: 0, appearances: 8, yellowCards: 1, redCards: 0, isBanned: false, team: { id: "demo-team-003", name: "Storm City",       shortName: "STO" } },
  { id: "p-028", name: "Ryan Scott",     position: "CDM", shirtNumber: 4,  teamId: "demo-team-003", age: 27, goals: 2,  assists: 2, appearances: 8, yellowCards: 2, redCards: 0, isBanned: false, team: { id: "demo-team-003", name: "Storm City",       shortName: "STO" } },
  { id: "p-029", name: "Dylan Green",    position: "CM",  shirtNumber: 8,  teamId: "demo-team-003", age: 24, goals: 2,  assists: 3, appearances: 8, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-003", name: "Storm City",       shortName: "STO" } },
  { id: "p-030", name: "Tyler Adams",    position: "CM",  shirtNumber: 10, teamId: "demo-team-003", age: 26, goals: 3,  assists: 2, appearances: 8, yellowCards: 1, redCards: 0, isBanned: false, team: { id: "demo-team-003", name: "Storm City",       shortName: "STO" } },
  { id: "p-031", name: "James Baker",    position: "LW",  shirtNumber: 11, teamId: "demo-team-003", age: 21, goals: 4,  assists: 1, appearances: 8, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-003", name: "Storm City",       shortName: "STO" } },
  { id: "p-032", name: "Carlos Nelson",  position: "RW",  shirtNumber: 7,  teamId: "demo-team-003", age: 23, goals: 3,  assists: 3, appearances: 8, yellowCards: 0, redCards: 1, isBanned: false, team: { id: "demo-team-003", name: "Storm City",       shortName: "STO" } },
  { id: "p-033", name: "Marcus Carter",  position: "ST",  shirtNumber: 9,  teamId: "demo-team-003", age: 25, goals: 6,  assists: 1, appearances: 8, yellowCards: 1, redCards: 0, isBanned: false, team: { id: "demo-team-003", name: "Storm City",       shortName: "STO" } },
  // Blaze Athletic
  { id: "p-034", name: "Oliver Mitchell",position: "GK",  shirtNumber: 1,  teamId: "demo-team-004", age: 28, goals: 0,  assists: 0, appearances: 8, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-004", name: "Blaze Athletic",   shortName: "BLA" } },
  { id: "p-035", name: "Kai Perez",      position: "CB",  shirtNumber: 5,  teamId: "demo-team-004", age: 25, goals: 1,  assists: 0, appearances: 8, yellowCards: 1, redCards: 0, isBanned: false, team: { id: "demo-team-004", name: "Blaze Athletic",   shortName: "BLA" } },
  { id: "p-036", name: "Liam Roberts",   position: "CB",  shirtNumber: 6,  teamId: "demo-team-004", age: 26, goals: 0,  assists: 1, appearances: 7, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-004", name: "Blaze Athletic",   shortName: "BLA" } },
  { id: "p-037", name: "Noah Turner",    position: "LB",  shirtNumber: 3,  teamId: "demo-team-004", age: 22, goals: 0,  assists: 2, appearances: 8, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-004", name: "Blaze Athletic",   shortName: "BLA" } },
  { id: "p-038", name: "Ethan Phillips", position: "RB",  shirtNumber: 2,  teamId: "demo-team-004", age: 24, goals: 1,  assists: 1, appearances: 8, yellowCards: 1, redCards: 0, isBanned: false, team: { id: "demo-team-004", name: "Blaze Athletic",   shortName: "BLA" } },
  { id: "p-039", name: "Mason Campbell", position: "CDM", shirtNumber: 4,  teamId: "demo-team-004", age: 27, goals: 2,  assists: 2, appearances: 8, yellowCards: 1, redCards: 0, isBanned: false, team: { id: "demo-team-004", name: "Blaze Athletic",   shortName: "BLA" } },
  { id: "p-040", name: "Lucas Parker",   position: "CM",  shirtNumber: 8,  teamId: "demo-team-004", age: 23, goals: 3,  assists: 2, appearances: 8, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-004", name: "Blaze Athletic",   shortName: "BLA" } },
  { id: "p-041", name: "Aiden Evans",    position: "CM",  shirtNumber: 10, teamId: "demo-team-004", age: 25, goals: 4,  assists: 3, appearances: 8, yellowCards: 1, redCards: 0, isBanned: false, team: { id: "demo-team-004", name: "Blaze Athletic",   shortName: "BLA" } },
  { id: "p-042", name: "Logan Edwards",  position: "LW",  shirtNumber: 11, teamId: "demo-team-004", age: 21, goals: 3,  assists: 2, appearances: 8, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-004", name: "Blaze Athletic",   shortName: "BLA" } },
  { id: "p-043", name: "Ryan Collins",   position: "RW",  shirtNumber: 7,  teamId: "demo-team-004", age: 23, goals: 5,  assists: 1, appearances: 8, yellowCards: 2, redCards: 0, isBanned: false, team: { id: "demo-team-004", name: "Blaze Athletic",   shortName: "BLA" } },
  { id: "p-044", name: "Dylan Stewart",  position: "ST",  shirtNumber: 9,  teamId: "demo-team-004", age: 26, goals: 8,  assists: 0, appearances: 8, yellowCards: 0, redCards: 0, isBanned: false, team: { id: "demo-team-004", name: "Blaze Athletic",   shortName: "BLA" } },
];

export const DEMO_LEAGUE = {
  id: "demo-league-001",
  name: "Demo Premier League",
  season: "2025/26",
  communityId: "demo-community-001",
  isActive: true,
  startDate: "2025-09-01T00:00:00.000Z",
  endDate: "2026-05-31T00:00:00.000Z",
  community: { id: "demo-community-001", name: "PitchSync Demo League" },
  _count: { matches: 10, leagueTeams: 4 },
};

export const DEMO_STANDINGS = [
  { id: "s-001", leagueId: "demo-league-001", teamId: "demo-team-001", played: 4, won: 3, drawn: 1, lost: 0, goalsFor: 10, goalsAgainst: 3, goalDifference: 7,  points: 10, team: { id: "demo-team-001", name: "Thunder FC",       shortName: "THU", logo: null } },
  { id: "s-002", leagueId: "demo-league-001", teamId: "demo-team-004", played: 4, won: 2, drawn: 1, lost: 1, goalsFor: 7,  goalsAgainst: 5, goalDifference: 2,  points: 7,  team: { id: "demo-team-004", name: "Blaze Athletic",   shortName: "BLA", logo: null } },
  { id: "s-003", leagueId: "demo-league-001", teamId: "demo-team-003", played: 4, won: 1, drawn: 2, lost: 1, goalsFor: 6,  goalsAgainst: 7, goalDifference: -1, points: 5,  team: { id: "demo-team-003", name: "Storm City",       shortName: "STO", logo: null } },
  { id: "s-004", leagueId: "demo-league-001", teamId: "demo-team-002", played: 4, won: 1, drawn: 0, lost: 3, goalsFor: 4,  goalsAgainst: 8, goalDifference: -4, points: 3,  team: { id: "demo-team-002", name: "Lightning United", shortName: "LIG", logo: null } },
];

const makeLineup = (teamId: string, matchId: string) => {
  const players = DEMO_PLAYERS.filter((p) => p.teamId === teamId).slice(0, 11);
  return players.map((p, i) => ({
    id: `lu-${matchId}-${p.id}`,
    matchId,
    playerId: p.id,
    player: { id: p.id, name: p.name, shirtNumber: p.shirtNumber, position: p.position },
    isStarter: true,
    minutesPlayed: 90,
    rating: [6.5, 7.0, 7.2, 6.8, 7.5, 6.9, 7.1, 8.0, 7.3, 7.7, 8.2][i] ?? 7.0,
    position: p.position,
  }));
};

const makeEvents = (matchId: string, homeTeamId: string, awayTeamId: string, homeGoals: number, awayGoals: number) => {
  const home = DEMO_PLAYERS.filter((p) => p.teamId === homeTeamId);
  const away = DEMO_PLAYERS.filter((p) => p.teamId === awayTeamId);
  const events = [];
  const minutes = [9, 23, 38, 51, 67, 74, 88];
  let mi = 0;
  for (let g = 0; g < homeGoals; g++) {
    const scorer = home[(g + 8) % home.length];
    const assist = home[(g + 6) % home.length];
    events.push({ id: `ev-${matchId}-h${g}`, matchId, type: "GOAL", minute: minutes[mi++ % minutes.length], playerId: scorer.id, relatedPlayerId: assist.id, player: { id: scorer.id, name: scorer.name, shirtNumber: scorer.shirtNumber }, relatedPlayer: { id: assist.id, name: assist.name, shirtNumber: assist.shirtNumber } });
  }
  for (let g = 0; g < awayGoals; g++) {
    const scorer = away[(g + 7) % away.length];
    const assist = away[(g + 5) % away.length];
    events.push({ id: `ev-${matchId}-a${g}`, matchId, type: "GOAL", minute: minutes[mi++ % minutes.length], playerId: scorer.id, relatedPlayerId: assist.id, player: { id: scorer.id, name: scorer.name, shirtNumber: scorer.shirtNumber }, relatedPlayer: { id: assist.id, name: assist.name, shirtNumber: assist.shirtNumber } });
  }
  // Yellow card
  if (home[3]) events.push({ id: `ev-${matchId}-yc`, matchId, type: "YELLOW_CARD", minute: 55, playerId: home[3].id, relatedPlayerId: null, player: { id: home[3].id, name: home[3].name, shirtNumber: home[3].shirtNumber }, relatedPlayer: null });
  return events.sort((a, b) => a.minute - b.minute);
};

export const DEMO_MATCHES = [
  {
    id: "demo-match-001", leagueId: "demo-league-001",
    homeTeamId: "demo-team-001", awayTeamId: "demo-team-002",
    homeScore: 3, awayScore: 1, status: "COMPLETED", matchDate: "2026-01-10T15:00:00.000Z", venue: "Demo Stadium",
    homeTeam: { id: "demo-team-001", name: "Thunder FC",       shortName: "THU", logo: null },
    awayTeam: { id: "demo-team-002", name: "Lightning United", shortName: "LIG", logo: null },
    league:   { id: "demo-league-001", name: "Demo Premier League", season: "2025/26", communityId: "demo-community-001" },
    get events()  { return makeEvents(this.id, "demo-team-001", "demo-team-002", 3, 1); },
    get lineups() { return [...makeLineup("demo-team-001", this.id), ...makeLineup("demo-team-002", this.id)]; },
    mvpVotes: [],
  },
  {
    id: "demo-match-002", leagueId: "demo-league-001",
    homeTeamId: "demo-team-003", awayTeamId: "demo-team-004",
    homeScore: 2, awayScore: 2, status: "COMPLETED", matchDate: "2026-01-10T17:30:00.000Z", venue: "Demo Stadium",
    homeTeam: { id: "demo-team-003", name: "Storm City",     shortName: "STO", logo: null },
    awayTeam: { id: "demo-team-004", name: "Blaze Athletic", shortName: "BLA", logo: null },
    league:   { id: "demo-league-001", name: "Demo Premier League", season: "2025/26", communityId: "demo-community-001" },
    get events()  { return makeEvents(this.id, "demo-team-003", "demo-team-004", 2, 2); },
    get lineups() { return [...makeLineup("demo-team-003", this.id), ...makeLineup("demo-team-004", this.id)]; },
    mvpVotes: [],
  },
  {
    id: "demo-match-003", leagueId: "demo-league-001",
    homeTeamId: "demo-team-002", awayTeamId: "demo-team-003",
    homeScore: 1, awayScore: 0, status: "COMPLETED", matchDate: "2026-01-17T15:00:00.000Z", venue: "Demo Stadium",
    homeTeam: { id: "demo-team-002", name: "Lightning United", shortName: "LIG", logo: null },
    awayTeam: { id: "demo-team-003", name: "Storm City",       shortName: "STO", logo: null },
    league:   { id: "demo-league-001", name: "Demo Premier League", season: "2025/26", communityId: "demo-community-001" },
    get events()  { return makeEvents(this.id, "demo-team-002", "demo-team-003", 1, 0); },
    get lineups() { return [...makeLineup("demo-team-002", this.id), ...makeLineup("demo-team-003", this.id)]; },
    mvpVotes: [],
  },
  {
    id: "demo-match-004", leagueId: "demo-league-001",
    homeTeamId: "demo-team-004", awayTeamId: "demo-team-001",
    homeScore: 0, awayScore: 2, status: "COMPLETED", matchDate: "2026-01-17T17:30:00.000Z", venue: "Demo Stadium",
    homeTeam: { id: "demo-team-004", name: "Blaze Athletic", shortName: "BLA", logo: null },
    awayTeam: { id: "demo-team-001", name: "Thunder FC",     shortName: "THU", logo: null },
    league:   { id: "demo-league-001", name: "Demo Premier League", season: "2025/26", communityId: "demo-community-001" },
    get events()  { return makeEvents(this.id, "demo-team-004", "demo-team-001", 0, 2); },
    get lineups() { return [...makeLineup("demo-team-004", this.id), ...makeLineup("demo-team-001", this.id)]; },
    mvpVotes: [],
  },
  {
    id: "demo-match-005", leagueId: "demo-league-001",
    homeTeamId: "demo-team-001", awayTeamId: "demo-team-003",
    homeScore: 4, awayScore: 1, status: "COMPLETED", matchDate: "2026-01-24T15:00:00.000Z", venue: "Demo Stadium",
    homeTeam: { id: "demo-team-001", name: "Thunder FC", shortName: "THU", logo: null },
    awayTeam: { id: "demo-team-003", name: "Storm City", shortName: "STO", logo: null },
    league:   { id: "demo-league-001", name: "Demo Premier League", season: "2025/26", communityId: "demo-community-001" },
    get events()  { return makeEvents(this.id, "demo-team-001", "demo-team-003", 4, 1); },
    get lineups() { return [...makeLineup("demo-team-001", this.id), ...makeLineup("demo-team-003", this.id)]; },
    mvpVotes: [],
  },
  {
    id: "demo-match-006", leagueId: "demo-league-001",
    homeTeamId: "demo-team-002", awayTeamId: "demo-team-004",
    homeScore: 2, awayScore: 3, status: "COMPLETED", matchDate: "2026-01-24T17:30:00.000Z", venue: "Demo Stadium",
    homeTeam: { id: "demo-team-002", name: "Lightning United", shortName: "LIG", logo: null },
    awayTeam: { id: "demo-team-004", name: "Blaze Athletic",   shortName: "BLA", logo: null },
    league:   { id: "demo-league-001", name: "Demo Premier League", season: "2025/26", communityId: "demo-community-001" },
    get events()  { return makeEvents(this.id, "demo-team-002", "demo-team-004", 2, 3); },
    get lineups() { return [...makeLineup("demo-team-002", this.id), ...makeLineup("demo-team-004", this.id)]; },
    mvpVotes: [],
  },
  {
    id: "demo-match-007", leagueId: "demo-league-001",
    homeTeamId: "demo-team-003", awayTeamId: "demo-team-001",
    homeScore: 1, awayScore: 1, status: "COMPLETED", matchDate: "2026-02-07T15:00:00.000Z", venue: "Demo Stadium",
    homeTeam: { id: "demo-team-003", name: "Storm City", shortName: "STO", logo: null },
    awayTeam: { id: "demo-team-001", name: "Thunder FC", shortName: "THU", logo: null },
    league:   { id: "demo-league-001", name: "Demo Premier League", season: "2025/26", communityId: "demo-community-001" },
    get events()  { return makeEvents(this.id, "demo-team-003", "demo-team-001", 1, 1); },
    get lineups() { return [...makeLineup("demo-team-003", this.id), ...makeLineup("demo-team-001", this.id)]; },
    mvpVotes: [],
  },
  {
    id: "demo-match-008", leagueId: "demo-league-001",
    homeTeamId: "demo-team-004", awayTeamId: "demo-team-002",
    homeScore: 2, awayScore: 0, status: "COMPLETED", matchDate: "2026-02-07T17:30:00.000Z", venue: "Demo Stadium",
    homeTeam: { id: "demo-team-004", name: "Blaze Athletic",   shortName: "BLA", logo: null },
    awayTeam: { id: "demo-team-002", name: "Lightning United", shortName: "LIG", logo: null },
    league:   { id: "demo-league-001", name: "Demo Premier League", season: "2025/26", communityId: "demo-community-001" },
    get events()  { return makeEvents(this.id, "demo-team-004", "demo-team-002", 2, 0); },
    get lineups() { return [...makeLineup("demo-team-004", this.id), ...makeLineup("demo-team-002", this.id)]; },
    mvpVotes: [],
  },
  {
    id: "demo-match-009", leagueId: "demo-league-001",
    homeTeamId: "demo-team-001", awayTeamId: "demo-team-004",
    homeScore: 0, awayScore: 0, status: "SCHEDULED", matchDate: "2026-03-10T15:00:00.000Z", venue: "Demo Stadium",
    homeTeam: { id: "demo-team-001", name: "Thunder FC",     shortName: "THU", logo: null },
    awayTeam: { id: "demo-team-004", name: "Blaze Athletic", shortName: "BLA", logo: null },
    league:   { id: "demo-league-001", name: "Demo Premier League", season: "2025/26", communityId: "demo-community-001" },
    events: [], lineups: [], mvpVotes: [],
  },
  {
    id: "demo-match-010", leagueId: "demo-league-001",
    homeTeamId: "demo-team-002", awayTeamId: "demo-team-003",
    homeScore: 0, awayScore: 0, status: "SCHEDULED", matchDate: "2026-03-10T17:30:00.000Z", venue: "Demo Stadium",
    homeTeam: { id: "demo-team-002", name: "Lightning United", shortName: "LIG", logo: null },
    awayTeam: { id: "demo-team-003", name: "Storm City",       shortName: "STO", logo: null },
    league:   { id: "demo-league-001", name: "Demo Premier League", season: "2025/26", communityId: "demo-community-001" },
    events: [], lineups: [], mvpVotes: [],
  },
];

export const DEMO_ANNOUNCEMENTS = [
  {
    id: "ann-001",
    title: "Welcome to PitchSync Demo!",
    content: "This is a fully loaded demo with 4 teams, 44 players, 8 completed matches, live standings, and full match events. Explore every feature — teams, players, leagues, standings, and match details all work!",
    authorRole: "ADMIN",
    communityId: "demo-community-001",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "ann-002",
    title: "Matchday 3 Results",
    content: "Thunder FC continue their unbeaten run with a 4-1 demolition of Storm City! Aiden Thomas bags a hat-trick. Blaze Athletic beat Lightning United 3-2 in a 5-goal thriller.",
    authorRole: "COMMUNITY_MOD",
    communityId: "demo-community-001",
    createdAt: "2026-01-25T12:00:00.000Z",
    updatedAt: "2026-01-25T12:00:00.000Z",
  },
  {
    id: "ann-003",
    title: "Next Fixtures - Matchday 5",
    content: "Upcoming: Thunder FC vs Blaze Athletic and Lightning United vs Storm City — both on March 10th. Don't miss the top-of-the-table clash!",
    authorRole: "COMMUNITY_MOD",
    communityId: "demo-community-001",
    createdAt: "2026-02-15T09:00:00.000Z",
    updatedAt: "2026-02-15T09:00:00.000Z",
  },
];

// Dashboard overview shape
export const DEMO_DASHBOARD_OVERVIEW = {
  totalTeams: 4,
  totalMatches: 8,
  activeLeagues: 1,
  totalGoals: 21,
  matchesThisWeek: 0,
  recentMatches: DEMO_MATCHES.filter((m) => m.status === "COMPLETED").slice(-5).reverse(),
  topScorers: [
    { id: "p-011", name: "Aiden Thomas",   goals: 9,  assists: 1, team: { name: "Thunder FC"       } },
    { id: "p-044", name: "Dylan Stewart",  goals: 8,  assists: 0, team: { name: "Blaze Athletic"   } },
    { id: "p-022", name: "Noah Walker",    goals: 7,  assists: 0, team: { name: "Lightning United" } },
    { id: "p-033", name: "Marcus Carter",  goals: 6,  assists: 1, team: { name: "Storm City"       } },
    { id: "p-010", name: "Lucas Anderson", goals: 6,  assists: 2, team: { name: "Thunder FC"       } },
  ],
  weeklyActivity: [
    { name: "10 Jan", matches: 2, goals: 7 },
    { name: "17 Jan", matches: 2, goals: 3 },
    { name: "24 Jan", matches: 2, goals: 8 },
    { name: "7 Feb",  matches: 2, goals: 3 },
    { name: "10 Mar", matches: 0, goals: 0 },
  ],
};

export const DEMO_EMAIL = "demo@example.com";

export function isDemoUser(email?: string | null) {
  return email === DEMO_EMAIL;
}
