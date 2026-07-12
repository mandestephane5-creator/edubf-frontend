"use client";

import { useEffect, useState } from "react";
import { PageHeader, Button } from "@/components/ui";
import { gradesApi } from "@/app/api-calls/academic";
import { classesApi } from "@/app/api-calls/directory";

const TERM = "TRIMESTRE_1";
const ACADEMIC_YEAR = "2025-2026";

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [repeatersClassId, setRepeatersClassId] = useState("");
  const [repeaters, setRepeaters] = useState(null);

  useEffect(() => {
    Promise.all([gradesApi.schoolStats(TERM, ACADEMIC_YEAR), classesApi.list()]).then(([s, c]) => {
      setStats(s);
      setClasses(c);
      setLoading(false);
    });
  }, []);

  async function loadRepeaters(classId) {
    setRepeatersClassId(classId);
    if (!classId) {
      setRepeaters(null);
      return;
    }
    setRepeaters(await gradesApi.repeaters(classId, ACADEMIC_YEAR));
  }

  if (loading) return <p className="text-sm text-muted">Chargement…</p>;

  return (
    <div>
      <PageHeader title="Statistiques" description="Résultats par classe et par matière, taux de réussite interne" />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-card bg-primary-soft p-4 text-center">
          <p className="text-xl font-semibold text-primary">{stats.schoolWide.composedCount}</p>
          <p className="text-xs text-primary">Ont composé</p>
        </div>
        <div className="rounded-card bg-emerald-soft p-4 text-center">
          <p className="text-xl font-semibold text-emerald">{stats.schoolWide.passingCount}</p>
          <p className="text-xs text-emerald">Moyenne ≥ 10</p>
        </div>
        <div className="rounded-card bg-rose-soft p-4 text-center">
          <p className="text-xl font-semibold text-rose">{stats.schoolWide.composedCount - stats.schoolWide.passingCount}</p>
          <p className="text-xs text-rose">Moyenne &lt; 10</p>
        </div>
      </div>

      <div className="mb-6 rounded-card bg-primary p-4 text-center text-white">
        <p className="text-xs opacity-80">Taux de réussite interne de l'école</p>
        <p className="text-2xl font-semibold">{stats.schoolWide.successRate}%</p>
      </div>

      <p className="mb-2 text-sm font-medium text-ink">Par classe</p>
      <div className="mb-6 overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-3 py-2">Classe</th>
              <th className="px-3 py-2">Ont composé</th>
              <th className="px-3 py-2">Moyenne ≥10</th>
              <th className="px-3 py-2">Réussite</th>
            </tr>
          </thead>
          <tbody>
            {stats.perClass.map((c) => (
              <tr key={c.classId} className="border-b border-border last:border-0">
                <td className="px-3 py-2">{c.className}</td>
                <td className="px-3 py-2">{c.composedCount}</td>
                <td className="px-3 py-2">{c.passingCount}</td>
                <td className={`px-3 py-2 font-medium ${c.successRate >= 80 ? "text-emerald" : c.successRate >= 50 ? "text-amber" : "text-rose"}`}>
                  {c.successRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mb-2 text-sm font-medium text-ink">Redoublants (fin d'année)</p>
      <div className="mb-3 flex gap-2">
        <select
          value={repeatersClassId}
          onChange={(e) => loadRepeaters(e.target.value)}
          className="focus-ring rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
        >
          <option value="">Choisir une classe…</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {repeaters && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium text-rose">Redoublent ({repeaters.repeaters.length})</p>
            <div className="space-y-1">
              {repeaters.repeaters.map((r) => (
                <div key={r.studentId} className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">
                  {r.firstName} {r.lastName} — {r.annualAverage}/20
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-emerald">Passent en classe supérieure ({repeaters.promoted.length})</p>
            <div className="space-y-1">
              {repeaters.promoted.map((r) => (
                <div key={r.studentId} className="rounded-md bg-emerald-soft px-3 py-2 text-sm text-emerald">
                  {r.firstName} {r.lastName} — {r.annualAverage}/20
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
