"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Crown,
  Users,
  Globe,
  Trophy,
  Swords,
  Target,
  Ban,
  Shield,
  Search,
  ArrowLeft,
  AlertTriangle,
  Check,
  X,
  ChevronDown,
} from "lucide-react";

interface Analytics {
  overview: {
    totalUsers: number;
    totalCommunities: number;
    suspendedCommunities: number;
    totalTeams: number;
    totalPlayers: number;
    totalLeagues: number;
    totalMatches: number;
    completedMatches: number;
    totalGoals: number;
    bannedUsers: number;
  };
  roleCounts: Record<string, number>;
  recent: { communities: number; users: number; matches: number };
  topCommunities: {
    id: string;
    name: string;
    logo: string | null;
    isSuspended: boolean;
    _count: { members: number; teams: number; leagues: number };
  }[];
}

interface Community {
  id: string;
  name: string;
  isSuspended: boolean;
  createdAt: string;
  createdBy: { name: string; email: string } | null;
  _count: { members: number; teams: number; leagues: number; announcements: number };
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
  _count: { communityMemberships: number };
}

export default function SuperAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userRole = (session?.user as any)?.role;

  const [tab, setTab] = useState<"overview" | "communities" | "users">("overview");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && userRole !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [status, userRole, router]);

  useEffect(() => {
    if (userRole !== "SUPER_ADMIN") return;

    Promise.all([
      fetch("/api/super-admin/analytics").then((r) => r.json()),
      fetch("/api/super-admin/communities").then((r) => r.json()),
    ])
      .then(([analyticsData, communitiesData]) => {
        setAnalytics(analyticsData);
        setCommunities(Array.isArray(communitiesData) ? communitiesData : []);
      })
      .catch(() => toast.error("Failed to load admin data"))
      .finally(() => setLoading(false));
  }, [userRole]);

  useEffect(() => {
    if (tab !== "users" || userRole !== "SUPER_ADMIN") return;
    const params = new URLSearchParams({ page: String(userPage), pageSize: "20" });
    if (userSearch) params.set("search", userSearch);
    fetch(`/api/super-admin/users?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setTotalUsers(data.total || 0);
      })
      .catch(() => toast.error("Failed to load users"));
  }, [tab, userPage, userSearch, userRole]);

  const handleSuspendCommunity = async (id: string, suspend: boolean) => {
    try {
      const res = await fetch(`/api/super-admin/communities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuspended: suspend }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error);
        return;
      }
      toast.success(suspend ? "Community suspended" : "Community unsuspended");
      setCommunities((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isSuspended: suspend } : c))
      );
    } catch {
      toast.error("Action failed");
    }
  };

  const handleUpdateUser = async (id: string, data: { role?: string; isBanned?: boolean }) => {
    try {
      const res = await fetch(`/api/super-admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("User updated");
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...result } : u)));
    } catch {
      toast.error("Action failed");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (userRole !== "SUPER_ADMIN") return null;

  const stats = analytics?.overview;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-surface text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            <h1 className="text-xl font-bold">Super Admin Dashboard</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          {(["overview", "communities", "users"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-primary text-white"
                  : "bg-surface text-muted-light hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: "Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
                { label: "Communities", value: stats.totalCommunities, icon: Globe, color: "text-accent" },
                { label: "Teams", value: stats.totalTeams, icon: Shield, color: "text-blue-400" },
                { label: "Leagues", value: stats.totalLeagues, icon: Trophy, color: "text-yellow-400" },
                { label: "Matches", value: stats.completedMatches, icon: Swords, color: "text-purple-400" },
                { label: "Goals", value: stats.totalGoals, icon: Target, color: "text-accent" },
                { label: "Players", value: stats.totalPlayers, icon: Users, color: "text-cyan-400" },
                { label: "Banned", value: stats.bannedUsers, icon: Ban, color: "text-red-400" },
                { label: "Suspended", value: stats.suspendedCommunities, icon: AlertTriangle, color: "text-orange-400" },
              ].map((s) => (
                <div key={s.label} className="glass-card p-4 rounded-2xl text-center">
                  <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Role Distribution */}
            {analytics?.roleCounts && (
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-semibold mb-4">Role Distribution</h3>
                <div className="flex gap-4 flex-wrap">
                  {Object.entries(analytics.roleCounts).map(([role, count]) => (
                    <div key={role} className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {role.replace("_", " ")}
                      </span>
                      <span className="text-sm font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 30-day Activity */}
            {analytics?.recent && (
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-semibold mb-4">Last 30 Days</h3>
                <div className="flex gap-8">
                  <div>
                    <p className="text-2xl font-bold text-accent">{analytics.recent.users}</p>
                    <p className="text-xs text-muted">New Users</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{analytics.recent.communities}</p>
                    <p className="text-xs text-muted">New Communities</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-400">{analytics.recent.matches}</p>
                    <p className="text-xs text-muted">Matches Played</p>
                  </div>
                </div>
              </div>
            )}

            {/* Top Communities */}
            {analytics?.topCommunities && analytics.topCommunities.length > 0 && (
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-semibold mb-4">Top Communities</h3>
                <div className="space-y-3">
                  {analytics.topCommunities.map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted w-6">#{i + 1}</span>
                        <span className="font-medium text-sm">{c.name}</span>
                        {c.isSuspended && (
                          <span className="text-xs text-red-400">(suspended)</span>
                        )}
                      </div>
                      <div className="flex gap-4 text-xs text-muted">
                        <span>{c._count.members} members</span>
                        <span>{c._count.teams} teams</span>
                        <span>{c._count.leagues} leagues</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Communities Tab */}
        {tab === "communities" && (
          <div className="space-y-3">
            {communities.map((community) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 rounded-2xl flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{community.name}</h3>
                    {community.isSuspended && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs">
                        Suspended
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 text-xs text-muted mt-1">
                    <span>{community._count.members} members</span>
                    <span>{community._count.teams} teams</span>
                    <span>{community._count.leagues} leagues</span>
                    {community.createdBy && (
                      <span>by {community.createdBy.name}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleSuspendCommunity(community.id, !community.isSuspended)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    community.isSuspended
                      ? "bg-accent/10 text-accent hover:bg-accent/20"
                      : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  }`}
                >
                  {community.isSuspended ? "Unsuspend" : "Suspend"}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-surface border border-border focus:border-primary outline-none"
              />
            </div>

            <div className="space-y-3">
              {users.map((u) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{u.name}</p>
                      <p className="text-xs text-muted truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                      className="px-2 py-1 rounded-lg bg-surface border border-border text-xs outline-none"
                    >
                      <option value="USER">USER</option>
                      <option value="COMMUNITY_MOD">COMMUNITY_MOD</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                    <button
                      onClick={() => handleUpdateUser(u.id, { isBanned: !u.isBanned })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        u.isBanned
                          ? "bg-accent/10 text-accent hover:bg-accent/20"
                          : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      }`}
                    >
                      {u.isBanned ? "Unban" : "Ban"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalUsers > 20 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                  disabled={userPage === 1}
                  className="px-3 py-1.5 rounded-lg bg-surface text-sm disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm text-muted">
                  Page {userPage} of {Math.ceil(totalUsers / 20)}
                </span>
                <button
                  onClick={() => setUserPage((p) => p + 1)}
                  disabled={userPage >= Math.ceil(totalUsers / 20)}
                  className="px-3 py-1.5 rounded-lg bg-surface text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
