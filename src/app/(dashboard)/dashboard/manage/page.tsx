"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  Trophy,
  Plus,
  UserPlus,
  Ban,
  Settings,
  ChevronDown,
} from "lucide-react";

interface ManagedCommunity {
  id: string;
  name: string;
  description: string | null;
  members: { id: string; role: string; user: { id: string; name: string; email: string } }[];
  teams: { id: string; name: string; shortName: string; _count?: { players: number } }[];
  leagues: { id: string; name: string; season: string; isActive: boolean }[];
  _count: { members: number; teams: number; leagues: number; bans: number };
}

export default function CommunityManagePage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const [communities, setCommunities] = useState<ManagedCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"members" | "teams" | "leagues" | "bans">("members");

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTeamId, setInviteTeamId] = useState("");
  const [inviting, setInviting] = useState(false);

  // League form
  const [showLeagueForm, setShowLeagueForm] = useState(false);
  const [leagueForm, setLeagueForm] = useState({ name: "", season: "" });
  const [creatingLeague, setCreatingLeague] = useState(false);

  useEffect(() => {
    // Fetch communities where user is mod
    fetch("/api/communities")
      .then((r) => r.json())
      .then((data) => {
        // We need full details per community, fetch each one
        const comms = Array.isArray(data) ? data : [];
        return Promise.all(
          comms.map((c: any) =>
            fetch(`/api/communities/${c.id}`)
              .then((r) => r.json())
              .catch(() => null)
          )
        );
      })
      .then((details) => {
        const valid = details.filter(Boolean) as ManagedCommunity[];
        setCommunities(valid);
        if (valid.length > 0) setSelectedId(valid[0].id);
      })
      .catch(() => toast.error("Failed to load communities"))
      .finally(() => setLoading(false));
  }, []);

  const selected = communities.find((c) => c.id === selectedId);

  const handleInvitePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteTeamId || !selected) return;
    setInviting(true);
    try {
      const res = await fetch("/api/teams/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, teamId: inviteTeamId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success("Invite sent!");
      setInviteEmail("");
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setCreatingLeague(true);
    try {
      const res = await fetch("/api/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...leagueForm, communityId: selected.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success("League created!");
      setShowLeagueForm(false);
      setLeagueForm({ name: "", season: "" });
      // Refresh community data
      const updated = await fetch(`/api/communities/${selected.id}`).then((r) => r.json());
      setCommunities((prev) => prev.map((c) => (c.id === selected.id ? updated : c)));
    } catch {
      toast.error("Failed to create league");
    } finally {
      setCreatingLeague(false);
    }
  };

  const handleBanUser = async (banUserId: string) => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/communities/${selected.id}/bans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: banUserId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success("User banned");
      // Refresh
      const updated = await fetch(`/api/communities/${selected.id}`).then((r) => r.json());
      setCommunities((prev) => prev.map((c) => (c.id === selected.id ? updated : c)));
    } catch {
      toast.error("Failed to ban user");
    }
  };

  const handlePromote = async (targetUserId: string, role: string) => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/communities/${selected.id}/promote`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success(`Role updated to ${role}`);
      const updated = await fetch(`/api/communities/${selected.id}`).then((r) => r.json());
      setCommunities((prev) => prev.map((c) => (c.id === selected.id ? updated : c)));
    } catch {
      toast.error("Failed to update role");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-surface rounded w-48 animate-pulse" />
        <div className="glass-card p-8 rounded-2xl animate-pulse">
          <div className="h-4 bg-surface rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="glass-card p-12 rounded-2xl text-center">
        <Shield className="w-12 h-12 text-muted mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">No Communities to Manage</h2>
        <p className="text-muted text-sm">Create a community first to start managing it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Community Management
        </h1>
        <p className="text-muted text-sm mt-1">Manage your community members, teams, and leagues</p>
      </div>

      {/* Community Selector */}
      {communities.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {communities.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedId === c.id
                  ? "bg-primary text-white"
                  : "bg-surface text-muted-light hover:text-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Members", value: selected._count.members, icon: Users },
              { label: "Teams", value: selected._count.teams, icon: Shield },
              { label: "Leagues", value: selected._count.leagues, icon: Trophy },
              { label: "Bans", value: selected._count.bans, icon: Ban },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-4 rounded-2xl text-center">
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {(["members", "teams", "leagues", "bans"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                  activeTab === t
                    ? "bg-primary text-white"
                    : "bg-surface text-muted-light hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "members" && (
            <div className="space-y-3">
              {selected.members?.map((member) => (
                <div
                  key={member.id}
                  className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {member.user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{member.user.name}</p>
                      <p className="text-xs text-muted truncate">{member.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {member.role}
                    </span>
                    {member.user.id !== userId && member.role !== "COMMUNITY_MOD" && (
                      <div className="flex gap-1">
                        {member.role === "VIEWER" && (
                          <button
                            onClick={() => handlePromote(member.user.id, "ADMIN")}
                            className="px-2 py-1 rounded-lg bg-accent/10 text-accent text-xs hover:bg-accent/20 transition-colors"
                          >
                            Promote
                          </button>
                        )}
                        {member.role === "ADMIN" && (
                          <button
                            onClick={() => handlePromote(member.user.id, "VIEWER")}
                            className="px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs hover:bg-yellow-500/20 transition-colors"
                          >
                            Demote
                          </button>
                        )}
                        <button
                          onClick={() => handleBanUser(member.user.id)}
                          className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors"
                        >
                          Ban
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "teams" && (
            <div className="space-y-4">
              {/* Invite Player */}
              <div className="glass-card p-5 rounded-2xl">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-primary" /> Invite Player to Team
                </h3>
                <form onSubmit={handleInvitePlayer} className="flex gap-3 flex-wrap">
                  <input
                    type="email"
                    placeholder="Player email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 min-w-50 px-4 py-2 text-sm rounded-xl bg-surface border border-border focus:border-primary outline-none"
                    required
                  />
                  <select
                    value={inviteTeamId}
                    onChange={(e) => setInviteTeamId(e.target.value)}
                    className="px-4 py-2 text-sm rounded-xl bg-surface border border-border focus:border-primary outline-none"
                    required
                  >
                    <option value="">Select team</option>
                    {selected.teams?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    {inviting ? "Sending..." : "Send Invite"}
                  </button>
                </form>
              </div>

              {/* Team List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selected.teams?.map((team) => (
                  <div key={team.id} className="glass-card p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                        {team.shortName?.slice(0, 3) || team.name.slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{team.name}</p>
                        <p className="text-xs text-muted">{team._count?.players || 0} players</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "leagues" && (
            <div className="space-y-4">
              <button
                onClick={() => setShowLeagueForm(!showLeagueForm)}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                <Plus className="w-4 h-4" /> Create League
              </button>

              {showLeagueForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="glass-card p-5 rounded-2xl"
                >
                  <form onSubmit={handleCreateLeague} className="space-y-3">
                    <input
                      type="text"
                      placeholder="League name"
                      value={leagueForm.name}
                      onChange={(e) => setLeagueForm({ ...leagueForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl bg-surface border border-border focus:border-primary outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Season (e.g., 2024/25)"
                      value={leagueForm.season}
                      onChange={(e) => setLeagueForm({ ...leagueForm, season: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl bg-surface border border-border focus:border-primary outline-none"
                      required
                    />
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={creatingLeague}
                        className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-medium disabled:opacity-50"
                      >
                        {creatingLeague ? "Creating..." : "Create"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowLeagueForm(false)}
                        className="px-6 py-2.5 border border-border rounded-xl text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selected.leagues?.map((league) => (
                  <div key={league.id} className="glass-card p-4 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-accent" />
                        <div>
                          <p className="font-semibold text-sm">{league.name}</p>
                          <p className="text-xs text-muted">{league.season}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          league.isActive
                            ? "bg-accent/10 text-accent"
                            : "bg-muted/10 text-muted"
                        }`}
                      >
                        {league.isActive ? "Active" : "Ended"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "bans" && (
            <div className="glass-card p-8 rounded-2xl text-center">
              <Ban className="w-8 h-8 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">
                Banned users are listed here. Use the members tab to ban users.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
