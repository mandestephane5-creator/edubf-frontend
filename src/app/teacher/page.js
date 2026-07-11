"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { teachersApi } from "@/app/api-calls/staff";
import { studentsApi } from "@/app/api-calls/students";

export default function TeacherHomePage() {
  const [assignments, setAssignments] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teachersApi.myAssignments().then(async (list) => {
      setAssignments(list);
      const uniqueClassIds = [...new Set(list.map((a) => a.classId))];
      const results = await Promise.all(uniqueClassIds.map((id) => studentsApi.list({ classId: id })));
      const map = {};
      uniqueClassIds.forEach((id, i) => (map[id] = results[i].length));
      setCounts(map);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader title="Mes classes" description="Les classes et matières qui vous ont été assignées" />

      {loading ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : assignments.length === 0 ? (
        <p className="text-sm text-muted">Aucune classe ne vous a été assignée pour le moment.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((a) => (
            <Link
              key={`${a.classId}-${a.subjectId}`}
              href={`/teacher/grades?classId=${a.classId}&subjectId=${a.subjectId}`}
              className="rounded-card border border-border bg-surface p-4 transition hover:border-primary"
            >
              <p className="text-sm font-medium text-ink">{a.className}</p>
              <p className="text-xs text-muted">{a.subjectName}</p>
              <p className="mt-2 text-xs text-muted">{counts[a.classId] ?? "…"} élève(s)</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
