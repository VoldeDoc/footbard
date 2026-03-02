"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FootballPitch } from "@/components/match/football-pitch";
import { EventTimeline } from "@/components/match/event-timeline";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Trophy,
  Sparkles,
  Vote,
  Users,
  Clock,
  Star,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

interface MatchData {
  id: string;
  homeScore: number;
  awayScore: number;
  status: string;
  matchDate: string;
  venue?: string;
  recap?: string;
  homeTeam: { id: string; name: string; shortName?: string; logo?: string };
  awayTeam: { id: string; name: string; shortName?: string; logo?: string };
  league: { id: string; name: string; season: string };
  lineups: any[];
  events: any[];
  mvpVotes: any[];
}

export default function MatchCenterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"timeline" | "lineups" | "recap">("timeline");
  const [generatingRecap, setGeneratingRecap] = useState(false);

  useEffect(() => {
    fetch(`/api/matches/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setMatch(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const generateRecap = async () => {
    if (!match) return;
    setGeneratingRecap(true);
    try {
      const res = await fetch("/api/matches/recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: match.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMatch({ ...match, recap: data.recap });
        toast.success("Match recap generated!");
      } else {
        toast.error("Failed to generate recap");
      }
    } catch {
      toast.error("Failed to generate recap");
    } finally {
      setGeneratingRecap(false);
    }
  };

  const voteMvp = async (playerId: string) => {
    if (!match) return;
    try {
      const res = await fetch("/api/matches/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: match.id, playerId }),
      });
      if (res.ok) {
        toast.success("Vote submitted!");
      }
    } catch {
      toast.error("Failed to vote");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!match) {
    return <div className="text-center py-20 text-muted">Match not found</div>;
  }

  const statusVariant = match.status === "COMPLETED" ? "success" : match.status === "LIVE" ? "live" : match.status === "CANCELLED" ? "danger" : "info";

  // Demo formation data if lineups exist
  const homeLineups = match.lineups
    .filter((l: any) => l.teamId === match.homeTeam.id)
    .map((l: any) => ({
      id: l.player.id,
      name: l.player.name,
      jerseyNumber: l.player.jerseyNumber,
      position: l.player.position,
      positionX: l.positionX,
      positionY: l.positionY,
      isStarter: l.isStarter,
      rating: l.rating,
    }));

  const awayLineups = match.lineups
    .filter((l: any) => l.teamId === match.awayTeam.id)
    .map((l: any) => ({
      id: l.player.id,
      name: l.player.name,
      jerseyNumber: l.player.jerseyNumber,
      position: l.player.position,
      positionX: l.positionX,
      positionY: l.positionY,
      isStarter: l.isStarter,
      rating: l.rating,
    }));

  // MVP vote tallies
  const mvpTally: Record<string, { count: number; player: any }> = {};
  match.mvpVotes.forEach((v: any) => {
    if (!mvpTally[v.playerId]) {
      mvpTally[v.playerId] = { count: 0, player: v.player };
    }
    mvpTally[v.playerId].count++;
  });
  const mvpLeader = Object.values(mvpTally).sort((a, b) => b.count - a.count)[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Link href="/dashboard/matches" className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Matches
      </Link>

      {/* Match Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card-glow p-6 md:p-8"
      >
        {/* League & Date */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-warning" />
            <span className="text-sm text-muted-light">{match.league.name} • {match.league.season}</span>
          </div>
          <Badge variant={statusVariant as any}>{match.status}</Badge>
        </div>

        {/* Score Display */}
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {/* Home Team */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 text-center"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              {match.homeTeam.logo ? (
                <img src={match.homeTeam.logo} alt="" className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">{match.homeTeam.name.charAt(0)}</span>
              )}
            </div>
            <h3 className="text-sm md:text-base font-semibold text-foreground">{match.homeTeam.name}</h3>
            <p className="text-xs text-muted">Home</p>
          </motion.div>

          {/* Score */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="px-8"
          >
            {match.status !== "SCHEDULED" ? (
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-black text-foreground">
                  {match.homeScore}
                  <span className="text-muted mx-3">-</span>
                  {match.awayScore}
                </p>
                {match.status === "COMPLETED" && (
                  <span className="text-xs text-accent uppercase tracking-widest font-semibold mt-2 block">Full Time</span>
                )}
                {match.status === "LIVE" && (
                  <span className="text-xs text-danger uppercase tracking-widest font-semibold mt-2 block animate-pulse">● Live</span>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg font-semibold text-muted">VS</p>
              </div>
            )}
          </motion.div>

          {/* Away Team */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 text-center"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              {match.awayTeam.logo ? (
                <img src={match.awayTeam.logo} alt="" className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">{match.awayTeam.name.charAt(0)}</span>
              )}
            </div>
            <h3 className="text-sm md:text-base font-semibold text-foreground">{match.awayTeam.name}</h3>
            <p className="text-xs text-muted">Away</p>
          </motion.div>
        </div>

        {/* Match Info */}
        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(match.matchDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
          {match.venue && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{match.venue}</span>
            </div>
          )}
        </div>

        {/* MVP */}
        {mvpLeader && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex items-center justify-center gap-3 p-3 rounded-xl bg-warning/10 border border-warning/20"
          >
            <Star className="w-5 h-5 text-warning" />
            <span className="text-sm text-warning font-medium">
              Man of the Match: <strong>{mvpLeader.player.name}</strong> ({mvpLeader.count} votes)
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-card rounded-xl w-fit">
        {[
          { key: "timeline" as const, label: "Timeline", icon: Clock },
          { key: "lineups" as const, label: "Lineups", icon: Users },
          { key: "recap" as const, label: "AI Recap", icon: Sparkles },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-white"
                : "text-muted-light hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "timeline" && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Match Timeline</h3>
            <EventTimeline events={match.events} homeTeamId={match.homeTeam.id} />
          </div>
        )}

        {activeTab === "lineups" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">{match.homeTeam.name}</h3>
              {homeLineups.length > 0 ? (
                <FootballPitch players={homeLineups} readonly />
              ) : (
                <p className="text-muted text-sm text-center py-8">No lineup set</p>
              )}
            </div>
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">{match.awayTeam.name}</h3>
              {awayLineups.length > 0 ? (
                <FootballPitch players={awayLineups} readonly />
              ) : (
                <p className="text-muted text-sm text-center py-8">No lineup set</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "recap" && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">AI Match Recap</h3>
              </div>
              {!match.recap && (
                <Button
                  size="sm"
                  icon={<Sparkles className="w-4 h-4" />}
                  onClick={generateRecap}
                  loading={generatingRecap}
                >
                  Generate
                </Button>
              )}
            </div>

            {match.recap ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-light leading-relaxed text-sm"
              >
                {match.recap}
              </motion.p>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                <p className="text-muted text-sm">No recap generated yet</p>
                <p className="text-muted text-xs mt-1">Click &quot;Generate&quot; to create an AI-powered match summary</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* MVP Voting Section */}
      {match.status === "COMPLETED" && match.lineups.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Vote className="w-5 h-5 text-warning" />
            <h3 className="text-lg font-semibold text-foreground">Vote for MVP</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {match.lineups
              .filter((l: any) => l.isStarter)
              .map((lineup: any) => (
                <motion.button
                  key={lineup.player.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => voteMvp(lineup.player.id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface hover:bg-card-hover border border-transparent hover:border-warning/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-xs">
                      {lineup.player.jerseyNumber || lineup.player.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-xs text-foreground font-medium text-center truncate w-full">
                    {lineup.player.name}
                  </span>
                </motion.button>
              ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
