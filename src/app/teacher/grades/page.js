"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader, Button, Badge } from "@/components/ui";
import Modal from "@/components/Modal";
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
  const [activeLabel, setActiveLabel] = useState("Devoir 1");
  const [students, setStudents] = useState([]);
  const [existingGrades, setExistingGrades] = useState([]); // notes déjà en base pour ce label
  const [values, setValues] = useState({}); // { [studentId]: valeur tapée }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [historyGrade, setHistoryGrade] = useState(null);
  const [history, setHistory] = useState([]);

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
    ]).then(([studentList, grades]) => {
      setStudents(studentList);
      setExistingGrades(grades.filter((g) => g.label === activeLabel));
      setValues({});
    });
  }, [active?.classId, active?.subjectId, activeLabel]);

  function gradeFor(studentId) {
    return existingGrades.find((g) => g.studentId === studentId);
  }

  function setValue(studentId, value) {
    setValues((prev) => ({ ...prev, [studentId]: value }));
  }

  async function handleSubmit() {
    if (!active) return;
    const items = students
      .map((s) => {
        const typed = values[s.id];
        const existing = gradeFor(s.id);
        const value = typed !== undefined && typed !== "" ? Number(typed) : existing?.value;
        return value !== undefined ? { studentId: s.id, value, maxValue: 20 } : null;
      })
      .filter(Boolean);

    if (items.length === 0) {
      setError("Saisissez au moins une note avant de soumettre.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await gradesApi.createBatch({
        classId: active.classId,
        subjectId: active.subjectId,
        term: TERM,
        academicYear: ACADEMIC_YEAR,
        label: activeLabel,
        items,
      });
      setMessage(`${activeLabel} soumis à validation. Le surveillant sera notifié.`);
      const grades = await gradesApi.list({ classId: active.classId, subjectId: active.subjectId, term: TERM, academicYear: ACADEMIC_YEAR });
      setExistingGrades(grades.filter((g) => g.label === activeLabel));
      setValues({});
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function openHistory(grade) {
    setHistoryGrade(grade);
    setHistory(await gradesApi.auditLogForGrade(grade.id));
  }

  if (loading) return <p className="text-sm text-muted">Chargement…</p>;

  if (assignments.length === 0) {
    return (
      <div>
        <PageHeader title="Notes" description="Aucune classe ne vous a été assignée pour le moment." />
      </div>
    );
  }

  const currentLabelStatus = existingGrades.length > 0 ? (existingGrades.every((g) => g.status === "VALIDATED") ? "VALIDATED" : "PENDING") : null;

  return (
    <div>
      <PageHeader title="Notes" description="Un devoir à la fois, soumis à validation" />

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

      <div className="mb-4 flex gap-2">
        {LABELS.map((label) => (
          <button
            key={label}
            onClick={() => setActiveLabel(label)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
              label === activeLabel ? "bg-primary text-white" : "border border-border bg-surface text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-ink">{activeLabel}</p>
        {currentLabelStatus && (
          <Badge value={currentLabelStatus === "VALIDATED" ? "Validé" : "En attente"} />
        )}
      </div>

      {message && <p className="mb-4 rounded-md bg-emerald-soft px-3 py-2 text-sm text-emerald">{message}</p>}
      {error && <p className="mb-4 rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      <div className="overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-3 py-2">Élève</th>
              <th className="px-3 py-2">Note /20</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const grade = gradeFor(s.id);
              return (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.25}
                      value={values[s.id] ?? grade?.value ?? ""}
                      onChange={(e) => setValue(s.id, e.target.value)}
                      className="focus-ring w-16 rounded-md border border-border bg-bg px-2 py-1 text-sm outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    {grade && (
                      <button onClick={() => openHistory(grade)} className="text-xs text-primary hover:underline">
                        Historique
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Envoi…" : `Soumettre ${activeLabel} à validation`}
        </Button>
      </div>

      <Modal open={!!historyGrade} onClose={() => setHistoryGrade(null)} title="Historique de la note">
        {historyGrade && (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              {historyGrade.student?.firstName} {historyGrade.student?.lastName} — {activeLabel}
            </p>
            {history.length === 0 ? (
              <p className="text-sm text-muted">Aucune modification enregistrée — note initiale.</p>
            ) : (
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="border-l-2 border-primary pl-3">
                    <p className="text-xs text-ink">
                      {h.oldValue} → {h.newValue}
                    </p>
                    <p className="text-xs text-muted">{new Date(h.createdAt).toLocaleString("fr-FR")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
