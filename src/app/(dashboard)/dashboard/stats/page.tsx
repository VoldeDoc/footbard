"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Target,
  Footprints,
  Shield,
  AlertTriangle,
  Star,
  Award,
  UserCircle,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "react-toastify";

interface StatsData {
  totalGoals: number;
  totalAssists: number;
  totalYellowCards: number;
  totalRedCards: number;
  topScorers: { id: string; name: string; goals: number; team: { name: string } }[];
  topAssists: { id: string; name: string; assists: number; team: { name: string } }[];
  highestRated: { id: string; name: string; averageRating: number; team: { name: string } }[];
  goalDistribution: { name: string; value: number }[];
}

const COLORS = ["#3b82f6", "#22c55e"];

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(setData)
      .catch(() => toast.error("Failed to load statistics"))
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
        title="Unable to load statistics"
        description="Could not fetch stats data. Please try again."
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Statistics"
        description="Comprehensive league analytics and performance data"
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Goals" value={data.totalGoals} icon={Target} color="green" delay={0} />
        <StatCard label="Total Assists" value={data.totalAssists} icon={Footprints} color="blue" delay={0.1} />
        <StatCard label="Yellow Cards" value={data.totalYellowCards} icon={Shield} color="yellow" delay={0.2} />
        <StatCard label="Red Cards" value={data.totalRedCards} icon={AlertTriangle} color="red" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Scorers Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Top Scorers</h3>
          </div>
          {data.topScorers.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topScorers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip
                    contentStyle={{
                      background: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#f1f5f9",
                    }}
                  />
                  <Bar dataKey="goals" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted text-sm">No goals recorded yet</p>
            </div>
          )}
        </motion.div>

        {/* Goal Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Goal Distribution</h3>
          </div>
          {data.goalDistribution.some((d) => d.value > 0) ? (
            <>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.goalDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.goalDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        color: "#f1f5f9",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {data.goalDistribution.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-sm text-muted-light">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted text-sm">No goal events recorded yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Assists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Footprints className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Top Assists</h3>
          </div>
          {data.topAssists.length > 0 ? (
            <div className="space-y-3">
              {data.topAssists.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-card-hover transition-colors"
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-primary/20 text-primary" : "bg-card text-muted"
                  }`}>
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{player.name}</p>
                    <p className="text-xs text-muted">{player.team.name}</p>
                  </div>
                  <span className="text-lg font-bold text-primary">{player.assists}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted text-sm">No assists recorded yet</p>
            </div>
          )}
        </motion.div>

        {/* Best Rated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-warning" />
            <h3 className="text-lg font-semibold text-foreground">Highest Rated</h3>
          </div>
          {data.highestRated.length > 0 ? (
            <div className="space-y-3">
              {data.highestRated.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-card-hover transition-colors"
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-warning/20 text-warning" : "bg-card text-muted"
                  }`}>
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                    <Star className="w-4 h-4 text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{player.name}</p>
                    <p className="text-xs text-muted">{player.team.name}</p>
                  </div>
                  <span className={`text-lg font-bold ${
                    player.averageRating >= 8 ? "text-accent" : player.averageRating >= 7 ? "text-warning" : "text-muted-light"
                  }`}>
                    {player.averageRating.toFixed(1)}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted text-sm">No ratings recorded yet</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
