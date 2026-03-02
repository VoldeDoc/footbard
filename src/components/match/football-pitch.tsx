"use client";

import { motion } from "framer-motion";

interface PlayerPosition {
  id: string;
  name: string;
  jerseyNumber?: number;
  position: string;
  positionX: number;
  positionY: number;
  isStarter: boolean;
  rating?: number;
}

interface FootballPitchProps {
  players: PlayerPosition[];
  onPlayerClick?: (player: PlayerPosition) => void;
  readonly?: boolean;
}

export function FootballPitch({ players, onPlayerClick, readonly }: FootballPitchProps) {
  const starters = players.filter((p) => p.isStarter);
  const subs = players.filter((p) => !p.isStarter);

  return (
    <div className="space-y-4">
      {/* Pitch SVG */}
      <div className="relative pitch-bg aspect-68/105 max-w-lg mx-auto overflow-hidden">
        {/* Pitch Markings SVG */}
        <svg
          viewBox="0 0 680 1050"
          className="absolute inset-0 w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outline */}
          <rect x="10" y="10" width="660" height="1030" stroke="rgba(255,255,255,0.4)" strokeWidth="2" rx="4" />

          {/* Halfway line */}
          <line x1="10" y1="525" x2="670" y2="525" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />

          {/* Center circle */}
          <circle cx="340" cy="525" r="91.5" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <circle cx="340" cy="525" r="4" fill="rgba(255,255,255,0.5)" />

          {/* Top penalty area */}
          <rect x="148" y="10" width="384" height="165" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <rect x="220" y="10" width="240" height="55" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <circle cx="340" cy="120" r="4" fill="rgba(255,255,255,0.5)" />
          <path d="M 262 175 A 91.5 91.5 0 0 0 418 175" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />

          {/* Bottom penalty area */}
          <rect x="148" y="875" width="384" height="165" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <rect x="220" y="985" width="240" height="55" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <circle cx="340" cy="930" r="4" fill="rgba(255,255,255,0.5)" />
          <path d="M 262 875 A 91.5 91.5 0 0 1 418 875" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />

          {/* Corner arcs */}
          <path d="M 10 20 A 10 10 0 0 0 20 10" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <path d="M 660 10 A 10 10 0 0 0 670 20" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <path d="M 10 1030 A 10 10 0 0 1 20 1040" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <path d="M 660 1040 A 10 10 0 0 1 670 1030" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
        </svg>

        {/* Players on pitch */}
        {starters.map((player, i) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{
              left: `${player.positionX}%`,
              top: `${player.positionY}%`,
            }}
            onClick={() => onPlayerClick?.(player)}
          >
            {/* Player marker */}
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary border-2 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white text-xs md:text-sm font-bold">
                  {player.jerseyNumber || "?"}
                </span>
              </div>
              {/* Rating badge */}
              {player.rating && player.rating > 0 && (
                <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center text-white ${
                  player.rating >= 8 ? "bg-accent" : player.rating >= 6 ? "bg-warning" : "bg-danger"
                }`}>
                  {player.rating.toFixed(0)}
                </span>
              )}
              {/* Name tooltip */}
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] md:text-xs bg-black/80 text-white px-2 py-0.5 rounded-md font-medium">
                  {player.name}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Substitutes Bench */}
      {subs.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-muted-light mb-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-card border border-border" />
            Substitutes
          </h4>
          <div className="flex flex-wrap gap-2">
            {subs.map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                onClick={() => onPlayerClick?.(player)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card hover:bg-card-hover border border-border transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-muted/20 flex items-center justify-center text-xs font-bold text-muted-light">
                  {player.jerseyNumber || "?"}
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{player.name}</p>
                  <p className="text-[10px] text-muted">{player.position}</p>
                </div>
                {player.rating && player.rating > 0 && (
                  <span className="text-xs font-bold text-primary ml-1">{player.rating.toFixed(1)}</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
