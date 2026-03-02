"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Trophy, Plus, Search, Users, Calendar } from "lucide-react";

interface League {
  id: string;
  name: string;
  season: string;
  isActive: boolean;
  community: { name: string };
  _count?: { teams: number; matches: number };
  leagueTeams?: { status: string }[];
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/leagues")
      .then((r) => r.json())
      .then((data) => setLeagues(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load leagues"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = leagues.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.season.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Leagues
          </h1>
          <p className="text-muted text-sm mt-1">All active and past leagues</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search leagues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 text-sm rounded-xl bg-surface border border-border focus:border-primary outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 rounded-2xl animate-pulse">
              <div className="h-4 bg-surface rounded w-2/3 mb-2" />
              <div className="h-3 bg-surface rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center">
          <Trophy className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-muted">No leagues found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((league) => (
            <motion.div
              key={league.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-2xl hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{league.name}</h3>
                    <p className="text-xs text-muted">{league.community?.name}</p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    league.isActive
                      ? "bg-accent/10 text-accent"
                      : "bg-muted/10 text-muted"
                  }`}
                >
                  {league.isActive ? "Active" : "Ended"}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted mt-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {league.season}
                </span>
                {league._count && (
                  <>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {league._count.teams} teams
                    </span>
                    <span>{league._count.matches} matches</span>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
