"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import {
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  Save,
  Camera,
  Mail,
  Lock,
} from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
] as const;

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: session?.user?.name ?? "",
    email: session?.user?.email ?? "",
    bio: "",
    location: "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [notifications, setNotifications] = useState({
    matchReminders: true,
    announcements: true,
    standings: false,
    emailDigest: true,
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Profile updated successfully");
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Password changed successfully");
    setPasswords({ current: "", newPassword: "", confirm: "" });
    setSaving(false);
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-56 shrink-0">
          <div className="glass-card p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "profile" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
              <motion.div variants={item} className="glass-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Profile Information</h3>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">
                      {(session?.user?.name?.[0] ?? "U").toUpperCase()}
                    </div>
                    <button className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-surface border border-white/10 text-muted hover:text-foreground transition-colors">
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{session?.user?.name ?? "User"}</p>
                    <p className="text-xs text-muted">{session?.user?.email ?? ""}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-light mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-light mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-light mb-2">Location</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        placeholder="City, Country"
                        className="w-full pl-10 pr-4 py-3 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-muted-light mb-2">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-3 text-sm min-h-25 resize-y"
                  />
                </div>

                <div className="flex justify-end mt-6">
                  <Button icon={<Save className="w-4 h-4" />} loading={saving} onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
              <motion.div variants={item} className="glass-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Change Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-muted-light mb-2">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        type="password"
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-light mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        type="password"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 text-sm"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-light mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 text-sm"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <Button type="submit" icon={<Save className="w-4 h-4" />} loading={saving}>
                    Update Password
                  </Button>
                </form>
              </motion.div>

              <motion.div variants={item} className="glass-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Active Sessions</h3>
                <p className="text-sm text-muted mb-4">Manage devices where you&#39;re logged in.</p>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Globe className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Current Session</p>
                      <p className="text-xs text-muted">Active now</p>
                    </div>
                  </div>
                  <span className="text-xs text-accent font-medium">Active</span>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div variants={container} initial="hidden" animate="show">
              <motion.div variants={item} className="glass-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { key: "matchReminders" as const, label: "Match Reminders", desc: "Get notified before matches start" },
                    { key: "announcements" as const, label: "Announcements", desc: "Receive community announcements" },
                    { key: "standings" as const, label: "Standings Updates", desc: "Weekly standings digest" },
                    { key: "emailDigest" as const, label: "Email Digest", desc: "Weekly summary via email" },
                  ].map((n) => (
                    <div
                      key={n.key}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{n.label}</p>
                        <p className="text-xs text-muted">{n.desc}</p>
                      </div>
                      <button
                        onClick={() =>
                          setNotifications({ ...notifications, [n.key]: !notifications[n.key] })
                        }
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          notifications[n.key] ? "bg-primary" : "bg-white/10"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            notifications[n.key] ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "appearance" && (
            <motion.div variants={container} initial="hidden" animate="show">
              <motion.div variants={item} className="glass-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Theme</h3>
                <div className="grid grid-cols-3 gap-4 max-w-md">
                  {[
                    { id: "dark", label: "Dark", colors: ["#0f172a", "#1e293b"] },
                    { id: "midnight", label: "Midnight", colors: ["#0a0e1a", "#111827"] },
                    { id: "pitch", label: "Pitch", colors: ["#0a1a0a", "#0f2f0f"] },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      className={`p-4 rounded-xl border transition-all ${
                        theme.id === "dark"
                          ? "border-primary bg-primary/5"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex gap-1 mb-3">
                        {theme.colors.map((c, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 rounded-md"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <p className="text-xs font-medium text-foreground">{theme.label}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
