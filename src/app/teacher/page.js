"use client";

import { useEffect, useState } from "react";
import { PageHeader, Button, Badge } from "@/components/ui";
import { studentsApi } from "@/app/api-calls/students";
import { gradesApi, incidentsApi } from "@/app/api-calls/academic";
import { teachersApi, disruptiveApi } from "@/app/api-calls/staff";

const TERM = "TRIMESTRE_1";
const ACADEMIC_YEAR = "2025-2026";
const LABELS = ["Devoir 1", "Devoir 2", "Composition"];

export default function TeacherHomePage() {
  const [assignments, setAssignments] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [students, setStudents] = useState([]);
  const [values, setValues] = useState({}); // { [studentId]: { [label]: value } }
  const [disruptiveCounts, setDisruptiveCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    teachersApi.myAssignments().then((list) => {
      setAssignments(list);
      setLoading(false);
    });
  }, []);

  const active = assignments[activeIndex];

  useEffect(() => {
    if (!active) return;
    setMessage("");
    Promise.all([
      studentsApi.list({ classId: active.classId }),
      gradesApi.list({ classId: active.classId, subjectId: active.subjectId, term: TERM, academicYear: ACADEMIC_YEAR }),
      disruptiveApi.countsForClass(active.classId),
    ]).then(([studentList, existingGrades, counts]) => {
      setStudents(studentList);
      const grid = {};
      for (const g of existingGrades) {
        grid[g.studentId] = grid[g.studentId] || {};
        grid[g.studentId][g.label] = g.value;
      }
      setValues(grid);
      const countMap = {};
      for (const c of counts) countMap[c.studentId] = c;
      setDisruptiveCounts(countMap);
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

  async function handleReportDisruptive(studentId) {
    const result = await disruptiveApi.report(studentId);
    setDisruptiveCounts((prev) => ({ ...prev, [studentId]: { count: result.count, threshold: 5 } }));
  }

  async function handleReportAbsence(studentId) {
    await incidentsApi.create({ studentId, type: "ABSENCE", date: new Date().toISOString() });
    setMessage("Absence signalée (en attente de validation).");
  }

  if (loading) return <p className="text-sm text-muted">Chargement…</p>;

  if (assignments.length === 0) {
    return (
      <div>
        <PageHeader title="Mes classes" description="Aucune classe ne vous a été assignée pour le moment." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Mes classes" description="Saisie des notes et incidents, soumis à validation" />

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
              <th className="px-3 py-2">Perturbateur ce mois</th>
              <th className="px-3 py-2"></th>
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
                <td className="px-3 py-2">
                  <Badge value={disruptiveCounts[s.id]?.count > 0 ? `${disruptiveCounts[s.id].count}/5` : "0/5"} />
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <button onClick={() => handleReportDisruptive(s.id)} className="mr-2 text-xs text-rose hover:underline">
                    ⚠ Signaler
                  </button>
                  <button onClick={() => handleReportAbsence(s.id)} className="text-xs text-amber hover:underline">
                    Absence
                  </button>
                </td>
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
