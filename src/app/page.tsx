"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  Zap,
  Search,
  ArrowRight,
  Clock,
  Target,
  Shield,
} from "lucide-react";

interface LiveMatch {
  id: string;
  homeTeam: { name: string; shortName: string; logo: string | null };
  awayTeam: { name: string; shortName: string; logo: string | null };
  homeScore: number;
  awayScore: number;
  matchDate: string;
  status: string;
  league: { name: string } | null;
}

interface TopPlayer {
  id: string;
  name: string;
  goals: number;
  assists: number;
  team: { name: string } | null;
}

interface CommunitySpotlight {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  _count: { members: number; teams: number; leagues: number };
}

export default function Home() {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<LiveMatch[]>([]);
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [communities, setCommunities] = useState<CommunitySpotlight[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch public data for homepage
    fetch("/api/homepage")
      .then((r) => r.json())
      .then((data) => {
        setLiveMatches(data.liveMatches || []);
        setUpcomingMatches(data.upcomingMatches || []);
        setTopPlayers(data.topPlayers || []);
        setCommunities(data.communities || []);
      })
      .catch(() => {});
  }, []);

  const filteredCommunities = communities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-60 -right-60 w-125 h-125 bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-100 h-100 bg-accent/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">PS</span>
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">PitchSync</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-medium text-muted-light hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 text-sm font-medium bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-12 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Community Football Platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight max-w-4xl mx-auto mb-6">
            Your
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
              {" "}
              Football Community{" "}
            </span>
            Starts Here
          </h1>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Create communities, organize leagues, track real match stats, and manage your
            football world — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 text-base font-semibold bg-linear-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white rounded-2xl transition-all shadow-lg shadow-primary/25"
            >
              Create Your Community
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 text-base font-semibold border border-white/10 hover:border-white/20 text-foreground rounded-2xl transition-all hover:bg-white/5"
            >
              Join as Player
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Live & Upcoming Matches */}
      {(liveMatches.length > 0 || upcomingMatches.length > 0) && (
        <section className="relative z-10 px-6 md:px-12 pb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-accent" />
            {liveMatches.length > 0 ? "Live Matches" : "Upcoming Fixtures"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(liveMatches.length > 0 ? liveMatches : upcomingMatches).slice(0, 6).map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 rounded-2xl"
              >
                {match.status === "LIVE" && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 mb-3">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    LIVE
                  </div>
                )}
                {match.status === "SCHEDULED" && (
                  <div className="flex items-center gap-1.5 text-xs text-muted mb-3">
                    <Clock className="w-3 h-3" />
                    {new Date(match.matchDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-xs font-bold shrink-0">
                      {match.homeTeam.shortName?.slice(0, 3) || match.homeTeam.name.slice(0, 3)}
                    </div>
                    <span className="text-sm font-medium truncate">{match.homeTeam.name}</span>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-surface text-sm font-bold text-center min-w-15">
                    {match.status === "COMPLETED" || match.status === "LIVE"
                      ? `${match.homeScore} - ${match.awayScore}`
                      : "vs"}
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span className="text-sm font-medium truncate">{match.awayTeam.name}</span>
                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-xs font-bold shrink-0">
                      {match.awayTeam.shortName?.slice(0, 3) || match.awayTeam.name.slice(0, 3)}
                    </div>
                  </div>
                </div>
                {match.league && (
                  <p className="text-xs text-muted mt-3">{match.league.name}</p>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Top Players */}
      {topPlayers.length > 0 && (
        <section className="relative z-10 px-6 md:px-12 pb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Top Scorers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topPlayers.slice(0, 8).map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 rounded-2xl flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  #{i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{player.name}</p>
                  <p className="text-xs text-muted truncate">{player.team?.name || "Free Agent"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-accent">{player.goals}</p>
                  <p className="text-xs text-muted">{player.assists}A</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Community Spotlight */}
      <section className="relative z-10 px-6 md:px-12 pb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            Community Spotlight
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-surface border border-border focus:border-primary outline-none"
            />
          </div>
        </div>

        {filteredCommunities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommunities.slice(0, 6).map((community) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-2xl hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                    {community.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{community.name}</h3>
                    <p className="text-xs text-muted truncate">{community.description || "Football community"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {community._count.members} members
                  </span>
                  <span>{community._count.teams} teams</span>
                  <span>{community._count.leagues} leagues</span>
                </div>
                <Link
                  href="/register"
                  className="mt-4 flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Join <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 rounded-2xl text-center">
            <Trophy className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">No communities found. Be the first to create one!</p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Create Community <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 md:px-12 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, title: "Communities", desc: "Create and join football communities" },
            { icon: Trophy, title: "Leagues", desc: "Organize round-robin leagues" },
            { icon: Target, title: "Real Stats", desc: "Track every goal, assist & card" },
            { icon: Shield, title: "Team Management", desc: "Invite players, set formations" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="glass-card p-6 rounded-2xl text-center"
            >
              <f.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-xs text-muted border-t border-border">
        &copy; {new Date().getFullYear()} PitchSync. Built for the beautiful game.
      </footer>
    </div>
  );
}
