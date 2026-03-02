"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Footprints,
  Star,
  Calendar,
  TrendingUp,
  Award,
  AlertTriangle,
  UserCircle,
  ArrowLeft,
  Activity,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Link from "next/link";

interface PlayerData {
  id: string;
  name: string;
  image?: string;
  position: string;
  shirtNumber?: number;
  goals: number;
  assists: number;
  appearances: number;
  averageRating: number;
  yellowCards: number;
  redCards: number;
  team: { id: string; name: string; logo?: string };
  lineups: any[];
  events: any[];
}

export default function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/players/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPlayer(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">Player not found</p>
      </div>
    );
  }

  const radarData = [
    { stat: "Goals", value: Math.min(player.goals * 10, 100) },
    { stat: "Assists", value: Math.min(player.assists * 12, 100) },
    { stat: "Rating", value: player.averageRating * 10 },
    { stat: "Matches", value: Math.min(player.appearances * 5, 100) },
    { stat: "Discipline", value: Math.max(100 - (player.yellowCards * 10 + player.redCards * 25), 0) },
  ];

  const matchRatings = player.lineups.slice(0, 10).map((l: any, i: number) => ({
    match: `M${i + 1}`,
    rating: l.rating || 0,
    minutes: l.minutesPlayed || 90,
  }));

  const heatLevel = player.averageRating >= 8 ? "On Fire" :
    player.averageRating >= 7 ? "Hot" :
    player.averageRating >= 6 ? "Warm" : "Cold";

  const heatColor = player.averageRating >= 8 ? "text-danger" :
    player.averageRating >= 7 ? "text-warning" :
    player.averageRating >= 6 ? "text-accent" : "text-primary";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <Link
        href="/dashboard/players"
        className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Players
      </Link>

      {/* Profile Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card-glow p-6 md:p-8"
      >
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
              {player.image ? (
                <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-16 h-16 text-primary" />
              )}
            </div>
            {player.shirtNumber && (
              <span className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-lg font-bold text-white">
                {player.shirtNumber}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{player.name}</h1>
              <Badge variant="info">{player.position}</Badge>
            </div>
            <p className="text-muted-light mb-4">{player.team.name}</p>

            {/* Heat Indicator */}
            <div className="flex items-center gap-2 mb-4">
              <Activity className={`w-5 h-5 ${heatColor}`} />
              <span className={`text-sm font-semibold ${heatColor}`}>{heatLevel}</span>
              <div className="flex gap-0.5 ml-2">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <motion.div
                    key={bar}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: bar * 0.1 }}
                    className={`w-1.5 rounded-full origin-bottom ${
                      bar <= Math.ceil(player.averageRating / 2)
                        ? heatColor.replace("text-", "bg-")
                        : "bg-card"
                    }`}
                    style={{ height: `${8 + bar * 4}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Target, label: "Goals", value: player.goals, color: "text-accent" },
                { icon: Footprints, label: "Assists", value: player.assists, color: "text-primary" },
                { icon: Calendar, label: "Apps", value: player.appearances, color: "text-warning" },
                { icon: Star, label: "Avg Rating", value: player.averageRating.toFixed(1), color: "text-accent" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="text-center p-3 rounded-xl bg-surface"
                >
                  <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Performance Profile</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Radar
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Match Ratings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-warning" />
            <h3 className="text-lg font-semibold text-foreground">Match Ratings</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matchRatings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="match" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#f1f5f9",
                  }}
                />
                <Bar dataKey="rating" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Discipline & Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h4 className="text-sm font-semibold text-foreground">Discipline</h4>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-7 rounded-sm bg-warning" />
              <span className="text-lg font-bold text-foreground">{player.yellowCards}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-7 rounded-sm bg-danger" />
              <span className="text-lg font-bold text-foreground">{player.redCards}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-accent" />
            <h4 className="text-sm font-semibold text-foreground">Contribution</h4>
          </div>
          <p className="text-2xl font-bold text-accent">{player.goals + player.assists}</p>
          <p className="text-xs text-muted">Goal Involvements</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Goals/Game</h4>
          </div>
          <p className="text-2xl font-bold text-primary">
            {player.appearances > 0 ? (player.goals / player.appearances).toFixed(2) : "0.00"}
          </p>
          <p className="text-xs text-muted">Per appearance</p>
        </motion.div>
      </div>

      {/* Match History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Match History</h3>
        {player.lineups.length > 0 ? (
          <div className="space-y-2">
            {player.lineups.map((lineup: any, i: number) => (
              <motion.div
                key={lineup.id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-card-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={lineup.isStarter ? "success" : "default"}>
                    {lineup.isStarter ? "START" : "SUB"}
                  </Badge>
                  <span className="text-sm text-foreground">
                    {lineup.match?.homeTeam?.name} vs {lineup.match?.awayTeam?.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted">{lineup.minutesPlayed}&apos; played</span>
                  <span className="font-semibold text-primary">{lineup.rating ? lineup.rating.toFixed(1) : "-"}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm text-center py-8">No match history yet</p>
        )}
      </motion.div>
    </motion.div>
  );
}
