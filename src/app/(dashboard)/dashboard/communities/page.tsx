"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Globe, Plus, Users, Trophy, Shield, Search } from "lucide-react";

interface Community {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  isSuspended: boolean;
  _count: { members: number; teams: number; leagues: number };
}

export default function CommunitiesPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "USER";
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  const canCreate = ["COMMUNITY_MOD", "SUPER_ADMIN"].includes(userRole);

  useEffect(() => {
    fetch("/api/communities")
      .then((r) => r.json())
      .then(setCommunities)
      .catch(() => toast.error("Failed to load communities"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success("Community created!");
      setCommunities((prev) => [data, ...prev]);
      setShowCreate(false);
      setForm({ name: "", description: "" });
    } catch {
      toast.error("Failed to create community");
    } finally {
      setCreating(false);
    }
  };

  const filtered = communities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            Communities
          </h1>
          <p className="text-muted text-sm mt-1">Browse and manage football communities</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm rounded-xl bg-surface border border-border focus:border-primary outline-none"
            />
          </div>
          {canCreate && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create
            </button>
          )}
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="glass-card p-6 rounded-2xl"
        >
          <h3 className="font-semibold mb-4">Create New Community</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-light mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Community name"
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-surface border border-border focus:border-primary outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-muted-light mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your community..."
                rows={3}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-surface border border-border focus:border-primary outline-none resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Community"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-6 py-2.5 border border-border rounded-xl text-sm hover:bg-surface transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Community List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 rounded-2xl animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-surface mb-3" />
              <div className="h-4 bg-surface rounded w-2/3 mb-2" />
              <div className="h-3 bg-surface rounded w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center">
          <Globe className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-muted">No communities found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((community) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-2xl hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                  {community.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{community.name}</h3>
                  {community.isSuspended && (
                    <span className="text-xs text-red-400 font-medium">Suspended</span>
                  )}
                </div>
              </div>
              {community.description && (
                <p className="text-sm text-muted mb-4 line-clamp-2">{community.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {community._count.members}
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> {community._count.teams}
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> {community._count.leagues}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
