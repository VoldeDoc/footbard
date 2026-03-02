"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { toast } from "react-toastify";
import { Plus, Swords, Calendar, MapPin, Search } from "lucide-react";
import Link from "next/link";

interface Match {
  id: string;
  matchDate: string;
  status: string;
  homeScore: number;
  awayScore: number;
  venue?: string;
  homeTeam: { id: string; name: string; shortName?: string; logo?: string };
  awayTeam: { id: string; name: string; shortName?: string; logo?: string };
  league: { id: string; name: string };
}

const statusBadge = (status: string) => {
  switch (status) {
    case "COMPLETED": return "success";
    case "LIVE": return "live";
    case "SCHEDULED": return "info";
    case "CANCELLED": return "danger";
    default: return "default";
  }
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch("/api/matches")
      .then((res) => (res.ok ? res.json() : []))
      .then(setMatches)
      .catch(() => toast.error("Failed to load matches"))
      .finally(() => setFetching(false));
  }, []);

  const filtered = matches.filter((m) => {
    const matchSearch =
      m.homeTeam.name.toLowerCase().includes(search.toLowerCase()) ||
      m.awayTeam.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <PageHeader
        title="Matches"
        description="View and manage all league matches"
        action={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
            Schedule Match
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search matches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 text-sm max-w-50"
        >
          <option value="">All Status</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="LIVE">Live</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Matches List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((match, i) => (
            <Link href={`/dashboard/matches/${match.id}`} key={match.id}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 hover:border-primary/30 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted">{match.league.name}</span>
                  <Badge variant={statusBadge(match.status) as any}>{match.status}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  {/* Home */}
                  <div className="flex-1 flex items-center gap-3 justify-end">
                    <span className="text-sm font-semibold text-foreground text-right">
                      {match.homeTeam.shortName || match.homeTeam.name}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      {match.homeTeam.logo ? (
                        <img src={match.homeTeam.logo} alt="" className="w-7 h-7 rounded object-cover" />
                      ) : (
                        <span className="text-primary font-bold text-xs">{match.homeTeam.name.charAt(0)}</span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="px-6 text-center">
                    {match.status === "COMPLETED" || match.status === "LIVE" ? (
                      <p className="text-xl font-bold text-accent">
                        {match.homeScore} - {match.awayScore}
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-muted">
                        {new Date(match.matchDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                    {match.status === "COMPLETED" && (
                      <span className="text-[10px] text-muted uppercase tracking-wider">FT</span>
                    )}
                  </div>

                  {/* Away */}
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      {match.awayTeam.logo ? (
                        <img src={match.awayTeam.logo} alt="" className="w-7 h-7 rounded object-cover" />
                      ) : (
                        <span className="text-primary font-bold text-xs">{match.awayTeam.name.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {match.awayTeam.shortName || match.awayTeam.name}
                    </span>
                  </div>
                </div>

                {match.venue && (
                  <div className="flex items-center gap-1 mt-3 justify-center">
                    <MapPin className="w-3 h-3 text-muted" />
                    <span className="text-xs text-muted">{match.venue}</span>
                  </div>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Swords className="w-8 h-8" />}
          title="No matches found"
          description="Schedule your first match to get started."
          action={
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
              Schedule Match
            </Button>
          }
        />
      )}

      {/* Schedule Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Schedule Match">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.info("Connect to API"); setShowModal(false); }}>
          <div>
            <label className="block text-sm font-medium text-muted-light mb-2">Date & Time</label>
            <input type="datetime-local" className="w-full px-4 py-3 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-light mb-2">Venue</label>
            <input type="text" placeholder="e.g., Main Stadium" className="w-full px-4 py-3 text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">Schedule</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
