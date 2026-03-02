"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Users,
  Swords,
  Trophy,
  TrendingUp,
  Calendar,
  Star,
  Activity,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-toastify";

interface OverviewData {
  totalTeams: number;
  totalMatches: number;
  activeLeagues: number;
  totalGoals: number;
  matchesThisWeek: number;
  recentMatches: any[];
  topScorers: any[];
  weeklyActivity: { name: string; matches: number; goals: number }[];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/overview")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(setData)
      .catch(() => toast.error("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={<BarChart3 className="w-8 h-8" />}
        title="Unable to load dashboard"
        description="Could not fetch dashboard data. Please try again."
      />
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <PageHeader
        title="Dashboard Overview"
        description="Welcome back! Here's what's happening in your league."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Teams" value={data.totalTeams} icon={Users} color="blue" delay={0} />
        <StatCard
          label="Matches Played"
          value={data.totalMatches}
          icon={Swords}
          color="green"
          delay={0.1}
          trend={data.matchesThisWeek > 0 ? `+${data.matchesThisWeek} this week` : undefined}
          trendUp={data.matchesThisWeek > 0}
        />
        <StatCard label="Active Leagues" value={data.activeLeagues} icon={Trophy} color="yellow" delay={0.2} />
        <StatCard label="Total Goals" value={data.totalGoals} icon={TrendingUp} color="red" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <motion.div variants={item} className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">League Activity</h3>
              <p className="text-sm text-muted">Goals &amp; Matches over time</p>
            </div>
            <Activity className="w-5 h-5 text-primary" />
          </div>
          {data.weeklyActivity.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weeklyActivity}>
                  <defs>
                    <linearGradient id="goals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="matches" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#f1f5f9",
                    }}
                  />
                  <Area type="monotone" dataKey="goals" stroke="#3b82f6" fill="url(#goals)" strokeWidth={2} />
                  <Area type="monotone" dataKey="matches" stroke="#22c55e" fill="url(#matches)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted text-sm">No match data yet. Complete some matches to see trends.</p>
            </div>
          )}
        </motion.div>

        {/* Top Scorers */}
        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Top Scorers</h3>
              <p className="text-sm text-muted">League leaders</p>
            </div>
            <Star className="w-5 h-5 text-warning" />
          </div>
          {data.topScorers.length > 0 ? (
            <div className="space-y-4">
              {data.topScorers.map((player: any, i: number) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-card-hover transition-colors"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-warning/20 text-warning" : "bg-card text-muted"
                  }`}>
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-semibold text-xs">{player.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{player.name}</p>
                    <p className="text-xs text-muted">{player.team.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent">{player.goals}G</p>
                    <p className="text-xs text-muted">{player.assists}A</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted text-sm">No goals scored yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Matches */}
      <motion.div variants={item} className="glass-card p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Recent Matches</h3>
            <p className="text-sm text-muted">Latest results</p>
          </div>
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        {data.recentMatches.length > 0 ? (
          <div className="space-y-3">
            {data.recentMatches.map((match: any, i: number) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl bg-surface-light hover:bg-card-hover transition-all duration-200 cursor-pointer"
              >
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium text-foreground">{match.homeTeam.name}</p>
                </div>
                <div className="px-6">
                  <p className="text-lg font-bold text-accent text-center">{match.homeScore} - {match.awayScore}</p>
                  <p className="text-[10px] text-muted text-center uppercase tracking-wider mt-0.5">Full Time</p>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{match.awayTeam.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted text-sm">No completed matches yet</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
