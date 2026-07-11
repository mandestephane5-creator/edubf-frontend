"use client";

import { useEffect, useState } from "react";
import { PageHeader, Badge } from "@/components/ui";
import { teachersApi, disruptiveApi } from "@/app/api-calls/staff";

export default function TeacherDisruptivePage() {
  const [assignments, setAssignments] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teachersApi.myAssignments().then((list) => {
      // Une classe par professeur suffit ici (pas besoin de répéter par matière)
      const uniqueClasses = [];
      const seen = new Set();
      for (const a of list) {
        if (!seen.has(a.classId)) {
          seen.add(a.classId);
          uniqueClasses.push(a);
        }
      }
      setAssignments(uniqueClasses);
      setLoading(false);
    });
  }, []);

  const active = assignments[activeIndex];

  useEffect(() => {
    if (!active) return;
    disruptiveApi.countsForClass(active.classId).then(setCounts);
  }, [active?.classId]);

  async function handleReport(studentId) {
    const result = await disruptiveApi.report(studentId);
    setCounts((prev) => prev.map((c) => (c.studentId === studentId ? { ...c, count: result.count } : c)));
  }

  if (loading) return <p className="text-sm text-muted">Chargement…</p>;

  if (assignments.length === 0) {
    return (
      <div>
        <PageHeader title="Élèves perturbateurs" description="Aucune classe ne vous a été assignée pour le moment." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Élèves perturbateurs"
        description="Signalement rapide — compte immédiatement, remis à zéro chaque mois. Une convocation est envoyée automatiquement au parent au 5e signalement."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {assignments.map((a, i) => (
          <button
            key={a.classId}
            onClick={() => setActiveIndex(i)}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              i === activeIndex ? "bg-primary text-white" : "border border-border bg-surface text-ink"
            }`}
          >
            {a.className}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {counts.map((c) => (
          <div key={c.studentId} className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2.5">
            <span className="text-sm text-ink">
              {c.firstName} {c.lastName}
            </span>
            <div className="flex items-center gap-3">
              <Badge value={c.count > 0 ? `${c.count}/${c.threshold}` : `0/${c.threshold}`} />
              <button onClick={() => handleReport(c.studentId)} className="text-xs font-medium text-rose hover:underline">
                ⚠ Signaler
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
