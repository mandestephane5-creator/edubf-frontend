"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { PageHeader, Button } from "@/components/ui";
import { notificationsApi } from "@/app/api-calls/misc";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      setNotifications(await notificationsApi.list());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleMarkAllRead() {
    await notificationsApi.markAllAsRead();
    load();
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Vos alertes et notifications récentes"
        action={<Button variant="outline" onClick={handleMarkAllRead}>Tout marquer comme lu</Button>}
      />

      {error && <p className="mb-4 rounded-lg bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : notifications.length === 0 ? (
        <div className="rounded-card border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
          Aucune notification pour le moment.
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex items-start gap-3 rounded-card border border-border bg-surface p-4 shadow-card ${
                !n.isRead ? "border-l-4 border-l-primary" : ""
              }`}
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Bell size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{n.title}</p>
                <p className="mt-0.5 text-sm text-muted">{n.message}</p>
                <p className="mt-1 text-xs text-muted">{new Date(n.createdAt).toLocaleString("fr-FR")}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
