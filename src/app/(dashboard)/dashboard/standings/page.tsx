"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3, Shield, TrendingUp, TrendingDown, Minus, Trophy } from "lucide-react";
import { toast } from "react-toastify";

interface StandingEntry {
  id: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  team: { id: string; name: string; shortName?: string; logo?: string };
}

interface League {
  id: string;
  name: string;
  season: string;
}

export default function StandingsPage() {
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [loading, setLoading] = useState(true);

  // Load leagues on mount
  useEffect(() => {
    fetch("/api/leagues")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setLeagues(data);
        if (data.length > 0) setSelectedLeague(data[0].id);
      })
      .catch(() => toast.error("Failed to load leagues"))
      .finally(() => setLoading(false));
  }, []);

  // Load standings when league changes
  useEffect(() => {
    if (!selectedLeague) return;
    setLoading(true);
    fetch(`/api/standings?leagueId=${selectedLeague}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setStandings)
      .catch(() => toast.error("Failed to load standings"))
      .finally(() => setLoading(false));
  }, [selectedLeague]);

  const formIcon = (gd: number) => {
    if (gd > 0) return <TrendingUp className="w-3.5 h-3.5 text-accent" />;
    if (gd < 0) return <TrendingDown className="w-3.5 h-3.5 text-danger" />;
    return <Minus className="w-3.5 h-3.5 text-muted" />;
  };

  const posColor = (pos: number) => {
    if (pos <= 2) return "bg-accent/20 text-accent border-accent/30";
    if (pos <= 4) return "bg-primary/20 text-primary border-primary/30";
    if (pos >= standings.length - 1) return "bg-danger/20 text-danger border-danger/30";
    return "bg-card text-muted-light border-border";
  };

  return (
    <div>
      <PageHeader
        title="Standings"
        description="Current league table"
      />

      {/* League Selector */}
      {leagues.length > 0 && (
        <div className="mb-6">
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="px-4 py-2.5 text-sm max-w-xs"
          >
            {leagues.map((l) => (
              <option key={l.id} value={l.id}>{l.name} — {l.season}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : leagues.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-8 h-8" />}
          title="No leagues"
          description="Create a league first, then standings will appear here."
        />
      ) : standings.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="w-8 h-8" />}
          title="No standings yet"
          description="Standings will be generated once matches are completed."
        />
      ) : (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider w-12">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Team</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wider">P</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wider">W</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wider">D</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wider">L</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wider">GF</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wider">GA</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wider">GD</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Pts</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {standings.map((entry, i) => (
                  <motion.tr
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-card-hover transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold border ${posColor(i + 1)}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          {entry.team.logo ? (
                            <img src={entry.team.logo} alt="" className="w-5 h-5 rounded object-cover" />
                          ) : (
                            <Shield className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <span className="font-medium text-foreground text-sm">{entry.team.name}</span>
                      </div>
                    </td>
                    <td className="text-center px-3 py-3 text-sm text-muted-light">{entry.played}</td>
                    <td className="text-center px-3 py-3 text-sm text-accent font-medium">{entry.won}</td>
                    <td className="text-center px-3 py-3 text-sm text-muted-light">{entry.drawn}</td>
                    <td className="text-center px-3 py-3 text-sm text-danger font-medium">{entry.lost}</td>
                    <td className="text-center px-3 py-3 text-sm text-muted-light">{entry.goalsFor}</td>
                    <td className="text-center px-3 py-3 text-sm text-muted-light">{entry.goalsAgainst}</td>
                    <td className="text-center px-3 py-3 text-sm">
                      <div className="flex items-center justify-center gap-1">
                        {formIcon(entry.goalDifference)}
                        <span className={entry.goalDifference > 0 ? "text-accent" : entry.goalDifference < 0 ? "text-danger" : "text-muted"}>
                          {entry.goalDifference > 0 ? "+" : ""}{entry.goalDifference}
                        </span>
                      </div>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className="text-lg font-bold text-foreground">{entry.points}</span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-2 p-4">
          {standings.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-card-hover transition-colors"
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border ${posColor(i + 1)}`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{entry.team.name}</p>
                <p className="text-xs text-muted">
                  {entry.played}P {entry.won}W {entry.drawn}D {entry.lost}L
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">{entry.points}</p>
                <p className={`text-xs ${entry.goalDifference >= 0 ? "text-accent" : "text-danger"}`}>
                  GD: {entry.goalDifference > 0 ? "+" : ""}{entry.goalDifference}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 px-4 py-3 border-t border-border text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-accent/20 border border-accent/30" />
            <span>Champions League</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary/20 border border-primary/30" />
            <span>Europa League</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-danger/20 border border-danger/30" />
            <span>Relegation</span>
          </div>
        </div>
      </motion.div>
      )}
    </div>
  );
}
