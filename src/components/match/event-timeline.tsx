"use client";

import { motion } from "framer-motion";
import { Target, ArrowRightLeft, Award, AlertTriangle, X } from "lucide-react";

interface MatchEvent {
  id: string;
  type: string;
  minute: number;
  player: { id: string; name: string; shirtNumber?: number };
  relatedPlayer?: { id: string; name: string; shirtNumber?: number } | null;
  description?: string;
}

interface EventTimelineProps {
  events: MatchEvent[];
  homeTeamId: string;
}

const eventConfig: Record<string, { icon: any; color: string; label: string }> = {
  GOAL: { icon: Target, color: "text-accent", label: "Goal" },
  ASSIST: { icon: Target, color: "text-primary", label: "Assist" },
  SUBSTITUTION: { icon: ArrowRightLeft, color: "text-primary-light", label: "Substitution" },
  YELLOW_CARD: { icon: AlertTriangle, color: "text-warning", label: "Yellow Card" },
  RED_CARD: { icon: X, color: "text-danger", label: "Red Card" },
  MVP: { icon: Award, color: "text-warning", label: "Man of the Match" },
};

export function EventTimeline({ events }: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted text-sm">
        No events recorded
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-4">
        {events.map((event, i) => {
          const config = eventConfig[event.type] || eventConfig.GOAL;
          const Icon = config.icon;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative flex items-start gap-4 pl-2"
            >
              {/* Minute Badge */}
              <div className="relative z-10 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-foreground">{event.minute}&apos;</span>
              </div>

              {/* Event Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-foreground font-medium">
                  {event.player.name}
                  {event.player.shirtNumber && (
                    <span className="text-muted ml-1">#{event.player.shirtNumber}</span>
                  )}
                </p>
                {event.relatedPlayer && (
                  <p className="text-xs text-muted mt-0.5">
                    {event.type === "SUBSTITUTION" ? "Replaced: " : "Assist: "}
                    {event.relatedPlayer.name}
                  </p>
                )}
                {event.description && (
                  <p className="text-xs text-muted mt-1">{event.description}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
