"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "react-toastify";
import { Plus, Users, Shield, Search } from "lucide-react";

interface Team {
  id: string;
  name: string;
  shortName?: string;
  logo?: string;
  _count: { players: number };
}

interface Community {
  id: string;
  name: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", shortName: "", communityId: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/teams").then((res) => (res.ok ? res.json() : [])),
      fetch("/api/communities?mine=true").then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([teamsData, communitiesData]) => {
        setTeams(teamsData);
        setCommunities(communitiesData);
        // Auto-select if user only belongs to one community
        if (communitiesData.length === 1) {
          setForm((f) => ({ ...f, communityId: communitiesData[0].id }));
        }
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setFetching(false));
  }, []);

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const team = await res.json();
        setTeams([...teams, { ...team, _count: { players: 0 } }]);
        setShowModal(false);
        setForm({ name: "", shortName: "", communityId: communities.length === 1 ? communities[0].id : "" });
        toast.success("Team created successfully!");
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Teams"
        description="Manage your league teams"
        action={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
            Add Team
          </Button>
        }
      />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm pl-10 pr-4 py-2.5 text-sm"
        />
      </div>

      {/* Teams Grid */}
      {filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTeams.map((team, i) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 hover:border-primary/30 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <Shield className="w-7 h-7 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{team.name}</h3>
                  {team.shortName && (
                    <p className="text-xs text-muted mt-0.5">{team.shortName}</p>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    <Users className="w-3.5 h-3.5 text-muted" />
                    <span className="text-xs text-muted">{team._count.players} players</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Shield className="w-8 h-8" />}
          title="No teams yet"
          description="Create your first team to get started with your league."
          action={
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
              Create Team
            </Button>
          }
        />
      )}

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Team">
        {communities.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-light text-sm mb-4">You need to create a community first before adding teams.</p>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          </div>
        ) : (
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-light mb-2">Team Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Thunder FC"
              className="w-full px-4 py-3 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-light mb-2">Short Name</label>
            <input
              type="text"
              value={form.shortName}
              onChange={(e) => setForm({ ...form, shortName: e.target.value })}
              placeholder="e.g., THU"
              className="w-full px-4 py-3 text-sm"
              maxLength={5}
            />
          </div>
          {communities.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-muted-light mb-2">Community</label>
              <select
                value={form.communityId}
                onChange={(e) => setForm({ ...form, communityId: e.target.value })}
                className="w-full px-4 py-3 text-sm"
                required
              >
                <option value="">Select a community...</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Create
            </Button>
          </div>
        </form>
        )}
      </Modal>
    </div>
  );
}
