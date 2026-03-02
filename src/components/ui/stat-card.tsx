"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: "blue" | "green" | "red" | "yellow";
  delay?: number;
}

const colorMap = {
  blue: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  green: { bg: "bg-accent/10", text: "text-accent", border: "border-accent/20" },
  red: { bg: "bg-danger/10", text: "text-danger", border: "border-danger/20" },
  yellow: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" },
};

export function StatCard({ label, value, icon: Icon, trend, trendUp, color = "blue", delay = 0 }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`stat-card glass-card p-5 hover:border-l-2 ${colors.border} transition-all duration-300 hover:shadow-lg`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colors.bg}`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trendUp ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"
          }`}>
            {trend}
          </span>
        )}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
        className="text-2xl font-bold text-foreground"
      >
        {value}
      </motion.p>
      <p className="text-sm text-muted mt-1">{label}</p>
    </motion.div>
  );
}
