"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "react-toastify";
import { Plus, Megaphone, Clock } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  community: { name: string };
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch("/api/announcements")
      .then((res) => (res.ok ? res.json() : []))
      .then(setAnnouncements)
      .catch(() => toast.error("Failed to load announcements"))
      .finally(() => setFetching(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, communityId: "default" }),
      });
      if (res.ok) {
        const ann = await res.json();
        setAnnouncements([{ ...ann, community: { name: "Default" } }, ...announcements]);
        setShowModal(false);
        setForm({ title: "", content: "" });
        toast.success("Announcement posted!");
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to post announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Community news and updates"
        action={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
            New Announcement
          </Button>
        }
      />

      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((ann, i) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                  <Megaphone className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{ann.title}</h3>
                  <p className="text-sm text-muted-light leading-relaxed mb-3">{ann.content}</p>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(ann.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Megaphone className="w-8 h-8" />}
          title="No announcements"
          description="Keep your community informed with announcements."
          action={
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
              Post Announcement
            </Button>
          }
        />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Announcement">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-light mb-2">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Announcement title"
              className="w-full px-4 py-3 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-light mb-2">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your announcement..."
              className="w-full px-4 py-3 text-sm min-h-30 resize-y"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={loading} className="flex-1">Post</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
