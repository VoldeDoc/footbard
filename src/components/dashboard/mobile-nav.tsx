"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Swords, BarChart3, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/teams", label: "Teams", icon: Users },
  { href: "/dashboard/matches", label: "Matches", icon: Swords },
  { href: "/dashboard/standings", label: "Table", icon: BarChart3 },
  { href: "/dashboard/leagues", label: "Leagues", icon: Trophy },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav md:hidden">
      <div className="flex items-center justify-around px-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-1 py-1 px-3"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute -top-1 w-8 h-1 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-primary" : "text-muted"
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
