"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui";
import { teachersApi, disruptiveApi } from "@/app/api-calls/staff";
import { gradesApi } from "@/app/api-calls/academic";

const TERM = "TRIMESTRE_1";
const ACADEMIC_YEAR = "2025-2026";

export default function TeacherStatisticsPage() {
  const [assignments, setAssignments] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teachersApi.myAssignments().then((list) => {
      setAssignments(list);
      setLoading(false);
    });
  }, []);

  const active = assignments[activeIndex];

  useEffect(() => {
    if (!active) return;
    setStats(null);
    gradesApi.teacherStats(active.classId, active.subjectId, TERM, ACADEMIC_YEAR).then(setStats);
  }, [active?.classId, active?.subjectId]);

  if (loading) return <p className="text-sm text-muted">Chargement…</p>;

  if (assignments.length === 0) {
    return (
      <div>
        <PageHeader title="Statistiques" description="Aucune classe ne vous a été assignée pour le moment." />
      </div>
    );
  }

  const trend = stats && stats.devoir1Average !== null && stats.devoir2Average !== null ? stats.devoir2Average - stats.devoir1Average : null;

  return (
    <div>
      <PageHeader title="Statistiques" description="Répartition et évolution des résultats de votre classe" />

      <div className="mb-4 flex flex-wrap gap-2">
        {assignments.map((a, i) => (
          <button
            key={`${a.classId}-${a.subjectId}`}
            onClick={() => setActiveIndex(i)}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              i === activeIndex ? "bg-primary text-white" : "border border-border bg-surface text-ink"
            }`}
          >
            {a.className} · {a.subjectName}
          </button>
        ))}
      </div>

      {!stats ? (
        <p className="text-sm text-muted">Chargement des statistiques…</p>
      ) : (
        <>
          <p className="mb-2 text-sm font-medium text-ink">Répartition par tranche</p>
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="rounded-card bg-rose-soft p-3 text-center">
              <p className="text-xl font-semibold text-rose">{stats.bands.below10}</p>
              <p className="text-xs text-rose">Moins de 10</p>
            </div>
            <div className="rounded-card bg-amber-soft p-3 text-center">
              <p className="text-xl font-semibold text-amber">{stats.bands.between10and15}</p>
              <p className="text-xs text-amber">10 à 15</p>
            </div>
            <div className="rounded-card bg-emerald-soft p-3 text-center">
              <p className="text-xl font-semibold text-emerald">{stats.bands.between15and20}</p>
              <p className="text-xs text-emerald">15 à 20</p>
            </div>
          </div>

          <p className="mb-2 text-sm font-medium text-ink">Comparaison entre devoirs</p>
          <div className="mb-2 flex items-end gap-4 rounded-card border border-border bg-surface p-4">
            <div className="text-center">
              <div
                className="mx-auto w-10 rounded-t-md bg-primary"
                style={{ height: `${Math.max(8, (stats.devoir1Average ?? 0) * 5)}px` }}
              />
              <p className="mt-1 text-xs text-muted">Devoir 1</p>
              <p className="text-sm font-semibold text-ink">{stats.devoir1Average ?? "—"}</p>
            </div>
            <div className="text-center">
              <div
                className="mx-auto w-10 rounded-t-md bg-emerald"
                style={{ height: `${Math.max(8, (stats.devoir2Average ?? 0) * 5)}px` }}
              />
              <p className="mt-1 text-xs text-muted">Devoir 2</p>
              <p className="text-sm font-semibold text-ink">{stats.devoir2Average ?? "—"}</p>
            </div>
          </div>
          {trend !== null && (
            <p className={`mb-6 text-sm ${trend >= 0 ? "text-emerald" : "text-rose"}`}>
              {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(2)} point{Math.abs(trend) > 1 ? "s" : ""} entre Devoir 1 et Devoir 2
            </p>
          )}

          <p className="mb-2 text-sm font-medium text-ink">Élèves en échec aux deux devoirs</p>
          {stats.failedBoth.length === 0 ? (
            <p className="text-sm text-muted">Aucun élève en dessous de la moyenne aux deux devoirs.</p>
          ) : (
            <div className="space-y-1.5">
              {stats.failedBoth.map((s) => (
                <div key={s.studentId} className="rounded-md border border-rose bg-rose-soft px-3 py-2 text-sm text-rose">
                  {s.firstName} {s.lastName}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
