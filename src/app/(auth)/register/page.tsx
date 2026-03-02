"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [wantsCommunityMod, setWantsCommunityMod] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, wantsCommunityMod }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
      } else {
        toast.success("Account created! Please sign in.");
        router.push("/login");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-3 mb-4"
        >
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-2xl">⚽</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Pitch<span className="text-primary">Sync</span>
          </h1>
        </motion.div>
        <p className="text-muted-light text-sm">Create your PitchSync account</p>
      </div>

      {/* Form Card */}
      <div className="glass-card-glow p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-muted-light mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 text-sm"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-muted-light mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 text-sm"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-muted-light mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-12 py-3 text-sm"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Account Type Selection */}
          <div>
            <label className="block text-sm font-medium text-muted-light mb-3">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWantsCommunityMod(false)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  !wantsCommunityMod
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface hover:border-muted text-muted-light"
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Player</span>
                <span className="text-xs text-muted">Join communities & play</span>
              </button>
              <button
                type="button"
                onClick={() => setWantsCommunityMod(true)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  wantsCommunityMod
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-surface hover:border-muted text-muted-light"
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Organizer</span>
                <span className="text-xs text-muted">Create & manage communities</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary-light transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
