"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { UserPlus, Check, X, Clock, Mail, ArrowRight } from "lucide-react";

interface JoinRequest {
  id: string;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string; image: string | null };
  team: { id: string; name: string; shortName: string; community: { id: string; name: string } };
}

interface Invite {
  id: string;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  team: { id: string; name: string; shortName: string; community: { id: string; name: string } };
}

export default function JoinRequestsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "USER";
  const [tab, setTab] = useState<"requests" | "invites">("requests");
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/teams/join-requests").then((r) => r.json()),
      fetch("/api/teams/invites").then((r) => r.json()),
    ])
      .then(([reqs, invs]) => {
        setRequests(Array.isArray(reqs) ? reqs : []);
        setInvites(Array.isArray(invs) ? invs : []);
      })
      .catch(() => toast.error("Failed to load requests"))
      .finally(() => setLoading(false));
  }, []);

  const handleRequestAction = async (requestId: string, status: "ACCEPTED" | "REJECTED") => {
    try {
      const res = await fetch("/api/teams/join-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success(`Request ${status.toLowerCase()}`);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r))
      );
    } catch {
      toast.error("Action failed");
    }
  };

  const handleInviteAction = async (inviteId: string, status: "ACCEPTED" | "REJECTED") => {
    try {
      const res = await fetch("/api/teams/invites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success(`Invite ${status.toLowerCase()}`);
      setInvites((prev) =>
        prev.map((i) => (i.id === inviteId ? { ...i, status } : i))
      );
    } catch {
      toast.error("Action failed");
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const pendingInvites = invites.filter((i) => i.status === "PENDING");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-primary" />
          Join Requests & Invites
        </h1>
        <p className="text-muted text-sm mt-1">Manage team membership requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("requests")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === "requests"
              ? "bg-primary text-white"
              : "bg-surface text-muted-light hover:text-foreground"
          }`}
        >
          Join Requests
          {pendingRequests.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("invites")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === "invites"
              ? "bg-primary text-white"
              : "bg-surface text-muted-light hover:text-foreground"
          }`}
        >
          Invites
          {pendingInvites.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
              {pendingInvites.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 rounded-2xl animate-pulse">
              <div className="h-4 bg-surface rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : tab === "requests" ? (
        requests.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center">
            <UserPlus className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">No join requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {req.user.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{req.user.name}</p>
                    <p className="text-xs text-muted">
                      wants to join <span className="text-primary">{req.team.name}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {req.status === "PENDING" ? (
                    <>
                      <button
                        onClick={() => handleRequestAction(req.id, "ACCEPTED")}
                        className="p-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
                        title="Accept"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRequestAction(req.id, "REJECTED")}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        req.status === "ACCEPTED"
                          ? "bg-accent/10 text-accent"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {req.status}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : invites.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center">
          <Mail className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-muted">No invites</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invites.map((inv) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{inv.user.name}</p>
                  <p className="text-xs text-muted">
                    invited to <span className="text-primary">{inv.team.name}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {inv.status === "PENDING" ? (
                  <>
                    <button
                      onClick={() => handleInviteAction(inv.id, "ACCEPTED")}
                      className="p-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
                      title="Accept"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleInviteAction(inv.id, "REJECTED")}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      inv.status === "ACCEPTED"
                        ? "bg-accent/10 text-accent"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {inv.status}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
