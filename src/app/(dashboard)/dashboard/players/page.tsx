"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "react-toastify";
import { Plus, Search, UserCircle, Star, Target, Footprints } from "lucide-react";
import Link from "next/link";

const positions = ["GK", "CB", "LB", "RB", "LWB", "RWB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST", "CF"];

interface Player {
  id: string;
  name: string;
  image?: string;
  position: string;
  jerseyNumber?: number;
  teamId: string;
  goals: number;
  assists: number;
  appearances: number;
  averageRating: number;
  team: { id: string; name: string; logo?: string };
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("");
  const [form, setForm] = useState({ name: "", position: "ST", jerseyNumber: "", teamId: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch("/api/players")
      .then((res) => (res.ok ? res.json() : []))
      .then(setPlayers)
      .catch(() => toast.error("Failed to load players"))
      .finally(() => setFetching(false));
  }, []);

  const filteredPlayers = players.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchPos = !posFilter || p.position === posFilter;
    return matchSearch && matchPos;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          jerseyNumber: form.jerseyNumber ? parseInt(form.jerseyNumber) : null,
        }),
      });
      if (res.ok) {
        toast.success("Player added successfully!");
        setShowModal(false);
        setForm({ name: "", position: "ST", jerseyNumber: "", teamId: "" });
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to add player");
    } finally {
      setLoading(false);
    }
  };

  const posColor = (pos: string) => {
    if (pos === "GK") return "warning";
    if (["CB", "LB", "RB", "LWB", "RWB"].includes(pos)) return "info";
    if (["CDM", "CM", "CAM", "LM", "RM"].includes(pos)) return "success";
    return "danger";
  };

  return (
    <div>
      <PageHeader
        title="Players"
        description="View and manage all league players"
        action={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
            Add Player
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
        <select
          value={posFilter}
          onChange={(e) => setPosFilter(e.target.value)}
          className="px-4 py-2.5 text-sm max-w-50"
        >
          <option value="">All Positions</option>
          {positions.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Players Grid */}
      {filteredPlayers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlayers.map((player, i) => (
            <Link href={`/dashboard/players/${player.id}`} key={player.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card p-5 hover:border-primary/30 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
                      {player.image ? (
                        <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    {player.jerseyNumber && (
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold text-foreground">
                        {player.jerseyNumber}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">{player.name}</h3>
                    <p className="text-xs text-muted mt-0.5">{player.team.name}</p>
                    <Badge variant={posColor(player.position) as any}>{player.position}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-surface">
                    <Target className="w-3.5 h-3.5 text-accent mx-auto mb-1" />
                    <p className="text-sm font-bold text-foreground">{player.goals}</p>
                    <p className="text-[10px] text-muted">Goals</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-surface">
                    <Footprints className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
                    <p className="text-sm font-bold text-foreground">{player.assists}</p>
                    <p className="text-[10px] text-muted">Assists</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-surface">
                    <Star className="w-3.5 h-3.5 text-warning mx-auto mb-1" />
                    <p className="text-sm font-bold text-foreground">{player.averageRating.toFixed(1)}</p>
                    <p className="text-[10px] text-muted">Rating</p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<UserCircle className="w-8 h-8" />}
          title="No players found"
          description="Add players to your teams to start tracking performance."
          action={
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
              Add Player
            </Button>
          }
        />
      )}

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Player">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-light mb-2">Player Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Marcus Johnson"
              className="w-full px-4 py-3 text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-light mb-2">Position</label>
              <select
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="w-full px-4 py-3 text-sm"
              >
                {positions.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-light mb-2">Jersey #</label>
              <input
                type="number"
                value={form.jerseyNumber}
                onChange={(e) => setForm({ ...form, jerseyNumber: e.target.value })}
                placeholder="10"
                className="w-full px-4 py-3 text-sm"
                min={1}
                max={99}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Add Player
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
