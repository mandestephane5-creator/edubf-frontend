"use client";

import { useEffect, useState } from "react";
import { PageHeader, DataTable, Button, Badge } from "@/components/ui";
import Modal from "@/components/Modal";
import { classesApi, subjectsApi } from "@/app/api-calls/directory";
import { studentsApi } from "@/app/api-calls/students";
import { incidentsApi } from "@/app/api-calls/academic";

const TYPES = [
  { value: "ABSENCE", label: "Absence" },
  { value: "RETARD", label: "Retard" },
  { value: "EXPULSION", label: "Expulsion" },
];

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const emptyForm = { studentId: "", type: "ABSENCE", date: "", time: "", subjectId: "", motif: "" };

export default function IncidentsPage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [classId, setClassId] = useState("");
  const [month, setMonth] = useState(currentMonth());
  const [incidents, setIncidents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      const [c, s] = await Promise.all([classesApi.list(), subjectsApi.list()]);
      setClasses(c);
      setSubjects(s);
    }
    init();
  }, []);

  async function loadIncidents() {
    if (!classId) return;
    try {
      const [inc, st] = await Promise.all([
        incidentsApi.list({ classId, month }),
        studentsApi.list({ classId }),
      ]);
      setIncidents(inc);
      setStudents(st);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, month]);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await incidentsApi.create({
        studentId: form.studentId,
        type: form.type,
        date: form.date,
        ...(form.type === "EXPULSION" && { time: form.time, subjectId: form.subjectId, motif: form.motif }),
      });
      setForm(emptyForm);
      setModalOpen(false);
      loadIncidents();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Incidents"
        description="Journal mensuel — absences, retards, expulsions"
        action={<Button onClick={() => setModalOpen(true)} disabled={!classId}>+ Ajouter un événement</Button>}
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Select label="Classe" value={classId} onChange={setClassId} placeholder="Choisir une classe">
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink">Mois</span>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="focus-ring rounded-md border border-border bg-white px-3 py-2 text-sm outline-none"
          />
        </label>
      </div>

      {error && <p className="mb-4 rounded-lg bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      {!classId ? (
        <p className="text-sm text-muted">Sélectionnez une classe pour afficher les incidents.</p>
      ) : (
        <DataTable
          columns={[
            { key: "student", header: "Élève", render: (r) => `${r.student.firstName} ${r.student.lastName}` },
            { key: "type", header: "Type", render: (r) => <Badge value={r.type} /> },
            { key: "date", header: "Date", render: (r) => new Date(r.date).toLocaleDateString("fr-FR") },
            { key: "time", header: "Heure", render: (r) => r.time || "—" },
            { key: "subject", header: "Matière", render: (r) => r.subject?.name || "—" },
            { key: "motif", header: "Motif", render: (r) => r.motif || "—" },
          ]}
          rows={incidents}
          emptyLabel="Aucun incident pour ce mois."
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un événement">
        <form onSubmit={handleCreate} className="space-y-3">
          <Select label="Élève" value={form.studentId} onChange={(v) => setForm((f) => ({ ...f, studentId: v }))} placeholder="Choisir un élève">
            {students.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
          </Select>
          <Select label="Type" value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Date</span>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="focus-ring w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none"
            />
          </label>

          {form.type === "EXPULSION" && (
            <>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Heure</span>
                <input
                  type="time"
                  required
                  value={form.time}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  className="focus-ring w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none"
                />
              </label>
              <Select label="Matière" value={form.subjectId} onChange={(v) => setForm((f) => ({ ...f, subjectId: v }))} placeholder="Choisir une matière">
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Motif</span>
                <input
                  required
                  value={form.motif}
                  onChange={(e) => setForm((f) => ({ ...f, motif: e.target.value }))}
                  placeholder="Bavardage, indiscipline…"
                  className="focus-ring w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none"
                />
              </label>
            </>
          )}

          {error && <p className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}
          <Button type="submit" className="w-full">Enregistrer</Button>
        </form>
      </Modal>
    </div>
  );
}

function Select({ label, value, onChange, children, placeholder }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring rounded-md border border-border bg-white px-3 py-2 text-sm outline-none"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
    </label>
  );
}
