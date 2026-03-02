"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Trophy,
  Swords,
  BarChart3,
  TrendingUp,
  Megaphone,
  Settings,
  ChevronLeft,
  X,
  Shield,
  UserPlus,
  Globe,
  Crown,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: string[]; // if set, only show for these roles
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/communities", label: "Communities", icon: Globe },
  { href: "/dashboard/teams", label: "Teams", icon: Users },
  { href: "/dashboard/players", label: "Players", icon: UserCircle },
  { href: "/dashboard/leagues", label: "Leagues", icon: Trophy },
  { href: "/dashboard/matches", label: "Matches", icon: Swords },
  { href: "/dashboard/standings", label: "Standings", icon: BarChart3 },
  { href: "/dashboard/stats", label: "Stats", icon: TrendingUp },
  { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
  // Community mod items
  { href: "/dashboard/join-requests", label: "Join Requests", icon: UserPlus, roles: ["COMMUNITY_MOD", "ADMIN", "SUPER_ADMIN"] },
  { href: "/dashboard/manage", label: "Community Mgmt", icon: Shield, roles: ["COMMUNITY_MOD", "SUPER_ADMIN"] },
  // Super admin items
  { href: "/super-admin", label: "Super Admin", icon: Crown, roles: ["SUPER_ADMIN"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  mobile?: boolean;
}

export function Sidebar({ isOpen, onToggle, mobile }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "USER";

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 256 : 80 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed top-0 left-0 h-full bg-sidebar border-r border-border z-30 flex flex-col ${
        mobile ? "w-72" : "hidden lg:flex"
      }`}
      style={mobile ? { width: 288 } : undefined}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <span className="text-xl">⚽</span>
          </div>
          <AnimatePresence>
            {(isOpen || mobile) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xl font-bold text-foreground whitespace-nowrap overflow-hidden"
              >
                Pitch<span className="text-primary">Sync</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-card text-muted hover:text-foreground transition-colors"
        >
          {mobile ? <X className="w-5 h-5" /> : <ChevronLeft className={`w-5 h-5 transition-transform ${!isOpen ? "rotate-180" : ""}`} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-light hover:text-foreground hover:bg-card"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : "text-muted group-hover:text-foreground"}`} />
              <AnimatePresence>
                {(isOpen || mobile) && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Role badge + footer */}
      <div className="p-4 border-t border-border">
        <AnimatePresence>
          {(isOpen || mobile) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <span className="inline-block px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
                {userRole.replace("_", " ")}
              </span>
              <p className="text-xs text-muted">PitchSync v2.0</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
