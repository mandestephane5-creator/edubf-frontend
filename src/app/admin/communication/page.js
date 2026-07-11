"use client";

import { useState } from "react";
import AnnouncementsPage from "../announcements/page";
import ReportsPage from "../reports/page";
import NotificationsPage from "../notifications/page";

export default function CommunicationPage() {
  const [tab, setTab] = useState("announcements");

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setTab("announcements")}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            tab === "announcements" ? "bg-primary text-white" : "border border-border bg-surface text-ink"
          }`}
        >
          Annonces
        </button>
        <button
          onClick={() => setTab("reports")}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            tab === "reports" ? "bg-primary text-white" : "border border-border bg-surface text-ink"
          }`}
        >
          Signalements
        </button>
        <button
          onClick={() => setTab("notifications")}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            tab === "notifications" ? "bg-primary text-white" : "border border-border bg-surface text-ink"
          }`}
        >
          Notifications
        </button>
      </div>

      {tab === "announcements" && <AnnouncementsPage />}
      {tab === "reports" && <ReportsPage />}
      {tab === "notifications" && <NotificationsPage />}
    </div>
  );
}
