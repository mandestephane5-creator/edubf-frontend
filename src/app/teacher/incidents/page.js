"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Check } from "lucide-react";
import { PageHeader, Button, Badge } from "@/components/ui";
import { teachersApi } from "@/app/api-calls/staff";
import { studentsApi } from "@/app/api-calls/students";
import { incidentsApi } from "@/app/api-calls/academic";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function TeacherIncidentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [students, setStudents] = useState([]);
  const [recent, setRecent] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [type, setType] = useState("ABSENCE");
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState("");
  const [motif, setMotif] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    teachersApi.myAssignments().then(setAssignments);
  }, []);

  const active = assignments[activeIndex];

  useEffect(() => {
    if (!active) return;
    setSelectedStudent(null);
    setQuery("");
    Promise.all([studentsApi.list({ classId: active.classId }), incidentsApi.list({ classId: active.classId })]).then(
      ([studentList, incidentList]) => {
        setStudents(studentList);
        setRecent(incidentList.slice(0, 8));
      }
    );
  }, [active?.classId]);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return students.filter((s) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(q)).slice(0, 5);
  }, [query, students]);

  async function handleReport() {
    if (!selectedStudent) return;
    setSubmitting(true);
    setMessage("");
    try {
      await incidentsApi.create({
        studentId: selectedStudent.id,
        type,
        date: new Date(date).toISOString(),
        // La matière est automatiquement celle de l'onglet actif : un professeur
        // signale forcément une expulsion dans sa propre matière, pas besoin de la
        // lui faire choisir à nouveau.
        ...(type === "EXPULSION" && { time, subjectId: active.subjectId, motif }),
      });
      setMessage("Incident signalé (en attente de validation).");
      setSelectedStudent(null);
      setQuery("");
      setTime("");
      setMotif("");
      const updated = await incidentsApi.list({ classId: active.classId });
      setRecent(updated.slice(0, 8));
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (assignments.length === 0) {
    return (
      <div>
        <PageHeader title="Incidents" description="Aucune classe ne vous a été assignée pour le moment." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Incidents" description="Signaler une absence, un retard ou une expulsion" />

      <div className="mb-4 flex flex-wrap gap-2">
        {assignments.map((a, i) => (
          <button
            key={`${a.classId}-${a.subjectId}`}
            onClick={() => setActiveIndex(i)}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              i === activeIndex ? "bg-primary text-white" : "border border-border bg-surface text-ink"
            }`}
          >
            {a.className}
          </button>
        ))}
      </div>

      <div className="mb-6 rounded-card border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-medium text-ink">Signaler un incident</p>

        <div className="relative mb-2.5">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : query}
            onChange={(e) => {
              setSelectedStudent(null);
              setQuery(e.target.value);
            }}
            placeholder="Rechercher un élève par nom…"
            className="focus-ring w-full rounded-md border border-border bg-bg py-2 pl-8 pr-3 text-sm outline-none"
          />
        </div>

        {!selectedStudent && filtered.length > 0 && (
          <div className="mb-2.5 overflow-hidden rounded-md border border-border">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedStudent(s);
                  setQuery("");
                }}
                className="flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left text-sm last:border-0 hover:bg-bg"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-soft text-[10px] font-semibold text-primary">
                  {s.firstName[0]}
                  {s.lastName[0]}
                </span>
                {s.firstName} {s.lastName}
              </button>
            ))}
          </div>
        )}

        {selectedStudent && (
          <div className="mb-2.5 flex items-center gap-2 rounded-md bg-primary-soft px-3 py-2 text-sm text-primary">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
              {selectedStudent.firstName[0]}
              {selectedStudent.lastName[0]}
            </span>
            <span className="flex-1 font-medium">
              {selectedStudent.firstName} {selectedStudent.lastName}
            </span>
            <Check size={16} />
          </div>
        )}

        <div className="mb-2.5 grid grid-cols-2 gap-2.5">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="focus-ring rounded-md border border-border bg-bg px-2 py-2 text-sm outline-none"
          >
            <option value="ABSENCE">Absence</option>
            <option value="RETARD">Retard</option>
            <option value="EXPULSION">Expulsion</option>
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="focus-ring rounded-md border border-border bg-bg px-2 py-2 text-sm outline-none"
          />
        </div>

        {type === "EXPULSION" && (
          <div className="mb-2.5 space-y-2.5">
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="focus-ring w-full rounded-md border border-border bg-bg px-2 py-2 text-sm outline-none"
            />
            <input
              required
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Motif : bavardage, indiscipline…"
              className="focus-ring w-full rounded-md border border-border bg-bg px-2 py-2 text-sm outline-none"
            />
            <p className="text-xs text-muted">Matière : {active?.subjectName} (celle de l'onglet actif)</p>
          </div>
        )}

        <Button className="w-full" onClick={handleReport} disabled={!selectedStudent || submitting}>
          {submitting ? "Envoi…" : "Signaler"}
        </Button>
        {message && <p className="mt-2 text-xs text-muted">{message}</p>}
      </div>

      <p className="mb-2 text-sm font-medium text-ink">Incidents récents de cette classe</p>
      {recent.length === 0 ? (
        <p className="text-sm text-muted">Aucun incident récent.</p>
      ) : (
        <div className="space-y-1.5">
          {recent.map((inc) => (
            <div key={inc.id} className="rounded-md border border-border bg-surface px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink">
                  {inc.student.firstName} {inc.student.lastName}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{new Date(inc.date).toLocaleDateString("fr-FR")}</span>
                  <Badge value={inc.type} />
                </div>
              </div>
              {inc.motif && <p className="mt-1 text-xs text-muted">Motif : {inc.motif}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
