"use client";

import { useEffect, useState } from "react";
import { Users, School, AlertTriangle, Bell } from "lucide-react";
import { PageHeader, StatCard } from "@/components/ui";
import { studentsApi } from "@/app/api-calls/students";
import { classesApi } from "@/app/api-calls/directory";
import { riskApi } from "@/app/api-calls/misc";
import { notificationsApi } from "@/app/api-calls/misc";

const TERM = "TRIMESTRE_1";
const ACADEMIC_YEAR = "2025-2026";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [students, classes, atRisk, notifs] = await Promise.all([
          studentsApi.list(),
          classesApi.list(),
          riskApi.list(TERM, ACADEMIC_YEAR),
          notificationsApi.list(),
        ]);
        setStats({ studentsCount: students.length, classesCount: classes.length, atRiskCount: atRisk.length });
        setNotifications(notifs.slice(0, 5));
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  return (
    <div>
      <PageHeader title="Tableau de bord" description="Aperçu de l'école Sainte Marie" />

      {error && <p className="mb-4 rounded-lg bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      {!stats ? (
        <p className="text-sm text-muted">Chargement des statistiques…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Élèves inscrits" value={stats.studentsCount} icon={Users} tone="primary" />
          <StatCard label="Classes" value={stats.classesCount} icon={School} tone="emerald" />
          <StatCard label="Élèves à risque" value={stats.atRiskCount} icon={AlertTriangle} tone="rose" />
        </div>
      )}

      <div className="mt-6 rounded-card border border-border bg-surface p-5 shadow-card">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <Bell size={16} /> Notifications récentes
        </h2>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted">Aucune notification pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li key={n.id} className="text-sm">
                <p className="font-medium text-ink">{n.title}</p>
                <p className="text-xs text-muted">{n.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
