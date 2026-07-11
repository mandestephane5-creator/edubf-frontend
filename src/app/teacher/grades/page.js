"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader, Button } from "@/components/ui";
import { studentsApi } from "@/app/api-calls/students";
import { gradesApi } from "@/app/api-calls/academic";
import { teachersApi } from "@/app/api-calls/staff";

const TERM = "TRIMESTRE_1";
const ACADEMIC_YEAR = "2025-2026";
const LABELS = ["Devoir 1", "Devoir 2", "Composition"];

export default function TeacherGradesPage() {
  const searchParams = useSearchParams();
  const [assignments, setAssignments] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [students, setStudents] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    teachersApi.myAssignments().then((list) => {
      setAssignments(list);
      const initialClassId = searchParams.get("classId");
      const initialSubjectId = searchParams.get("subjectId");
      if (initialClassId && initialSubjectId) {
        const idx = list.findIndex((a) => a.classId === initialClassId && a.subjectId === initialSubjectId);
        if (idx !== -1) setActiveIndex(idx);
      }
      setLoading(false);
    });
  }, [searchParams]);

  const active = assignments[activeIndex];

  useEffect(() => {
    if (!active) return;
    setMessage("");
    Promise.all([
      studentsApi.list({ classId: active.classId }),
      gradesApi.list({ classId: active.classId, subjectId: active.subjectId, term: TERM, academicYear: ACADEMIC_YEAR }),
    ]).then(([studentList, existingGrades]) => {
      setStudents(studentList);
      const grid = {};
      for (const g of existingGrades) {
        grid[g.studentId] = grid[g.studentId] || {};
        grid[g.studentId][g.label] = g.value;
      }
      setValues(grid);
    });
  }, [active?.classId, active?.subjectId]);

  function setValue(studentId, label, value) {
    setValues((prev) => ({ ...prev, [studentId]: { ...prev[studentId], [label]: value } }));
  }

  async function handleSubmit() {
    if (!active) return;
    setSubmitting(true);
    setError("");
    try {
      const calls = [];
      for (const student of students) {
        for (const label of LABELS) {
          const value = values[student.id]?.[label];
          if (value === undefined || value === "" || value === null) continue;
          calls.push(
            gradesApi.create({
              studentId: student.id,
              classId: active.classId,
              subjectId: active.subjectId,
              value: Number(value),
              maxValue: 20,
              term: TERM,
              academicYear: ACADEMIC_YEAR,
              label,
            })
          );
        }
      }
      await Promise.all(calls);
      setMessage("Notes soumises à validation. Elles seront visibles aux parents après validation par le surveillant.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Chargement…</p>;

  if (assignments.length === 0) {
    return (
      <div>
        <PageHeader title="Notes" description="Aucune classe ne vous a été assignée pour le moment." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Notes" description="Saisie par classe et matière, soumise à validation" />

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

      {message && <p className="mb-4 rounded-md bg-emerald-soft px-3 py-2 text-sm text-emerald">{message}</p>}
      {error && <p className="mb-4 rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      <div className="overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-3 py-2">Élève</th>
              {LABELS.map((l) => (
                <th key={l} className="px-3 py-2">
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2">
                  {s.firstName} {s.lastName}
                </td>
                {LABELS.map((label) => (
                  <td key={label} className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.25}
                      value={values[s.id]?.[label] ?? ""}
                      onChange={(e) => setValue(s.id, label, e.target.value)}
                      className="focus-ring w-16 rounded-md border border-border bg-bg px-2 py-1 text-sm outline-none"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Envoi…" : "Soumettre à validation"}
        </Button>
      </div>
    </div>
  );
}
