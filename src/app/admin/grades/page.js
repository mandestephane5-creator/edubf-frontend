"use client";

import { useEffect, useState } from "react";
import { PageHeader, DataTable, Button, Badge } from "@/components/ui";
import Modal from "@/components/Modal";
import { classesApi } from "@/app/api-calls/directory";
import { studentsApi } from "@/app/api-calls/students";
import { gradesApi } from "@/app/api-calls/academic";

const TERMS = [
  { value: "TRIMESTRE_1", label: "Trimestre 1" },
  { value: "TRIMESTRE_2", label: "Trimestre 2" },
  { value: "TRIMESTRE_3", label: "Trimestre 3" },
];

export default function GradesPage() {
  const [classes, setClasses] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]); // matières + coefficients de la classe sélectionnée
  const [students, setStudents] = useState([]);
  const [classId, setClassId] = useState("");
  const [term, setTerm] = useState("TRIMESTRE_1");
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [grades, setGrades] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ studentId: "", subjectId: "", value: "", coefficient: "1", label: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    classesApi.list().then(setClasses);
  }, []);

  // Recharge les matières propres à la classe sélectionnée (avec leur coefficient) dès qu'elle change
  useEffect(() => {
    if (!classId) {
      setClassSubjects([]);
      return;
    }
    classesApi.getById(classId).then((c) => setClassSubjects(c.subjects));
  }, [classId]);

  async function loadGrades() {
    if (!classId) return;
    try {
      const [g, s] = await Promise.all([
        gradesApi.list({ classId, term, academicYear }),
        studentsApi.list({ classId }),
      ]);
      setGrades(g);
      setStudents(s);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, term, academicYear]);

  function handleSubjectChange(subjectId) {
    const match = classSubjects.find((cs) => cs.subject.id === subjectId);
    setForm((f) => ({ ...f, subjectId, coefficient: match ? String(match.coefficient) : "1" }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await gradesApi.create({
        studentId: form.studentId,
        classId,
        subjectId: form.subjectId,
        value: Number(form.value),
        coefficient: Number(form.coefficient),
        term,
        academicYear,
        label: form.label || undefined,
      });
      setForm({ studentId: "", subjectId: "", value: "", coefficient: "1", label: "" });
      setModalOpen(false);
      loadGrades();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Notes"
        description="Saisie et consultation des notes par classe"
        action={
          <Button onClick={() => setModalOpen(true)} disabled={!classId || classSubjects.length === 0}>
            + Ajouter une note
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Select label="Classe" value={classId} onChange={setClassId} placeholder="Choisir une classe">
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select label="Trimestre" value={term} onChange={setTerm}>
          {TERMS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <TextField label="Année scolaire" value={academicYear} onChange={setAcademicYear} />
      </div>

      {error && <p className="mb-4 rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      {classId && classSubjects.length === 0 && (
        <p className="mb-4 rounded-md bg-amber-soft px-3 py-2 text-sm text-amber">
          Cette classe n'a pas encore de matière assignée. Va dans{" "}
          <a href={`/admin/classes/${classId}`} className="underline">Classes → Gérer les matières</a> pour en ajouter.
        </p>
      )}

      {!classId ? (
        <p className="text-sm text-muted">Sélectionnez une classe pour afficher les notes.</p>
      ) : (
        <DataTable
          columns={[
            { key: "student", header: "Élève", render: (r) => `${r.student.firstName} ${r.student.lastName}` },
            { key: "subject", header: "Matière", render: (r) => r.subject.name },
            { key: "value", header: "Note", render: (r) => `${r.value}/${r.maxValue}` },
            { key: "coefficient", header: "Coef." },
            { key: "label", header: "Libellé", render: (r) => r.label || "—" },
          ]}
          rows={grades}
          emptyLabel="Aucune note saisie pour ces filtres."
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter une note">
        <form onSubmit={handleCreate} className="space-y-3">
          <Select
            label="Élève"
            value={form.studentId}
            onChange={(v) => setForm((f) => ({ ...f, studentId: v }))}
            placeholder="Choisir un élève"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </Select>
          <Select
            label="Matière"
            value={form.subjectId}
            onChange={handleSubjectChange}
            placeholder={classSubjects.length === 0 ? "Aucune matière assignée à cette classe" : "Choisir une matière"}
          >
            {classSubjects.map((cs) => (
              <option key={cs.subject.id} value={cs.subject.id}>
                {cs.subject.name} (coef. {cs.coefficient})
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Note (/20)" type="number" value={form.value} onChange={(v) => setForm((f) => ({ ...f, value: v }))} />
            <TextField
              label="Coefficient"
              type="number"
              value={form.coefficient}
              onChange={(v) => setForm((f) => ({ ...f, coefficient: v }))}
            />
          </div>
          <TextField
            label="Libellé (optionnel)"
            value={form.label}
            onChange={(v) => setForm((f) => ({ ...f, label: v }))}
            required={false}
            placeholder="Devoir 1, Composition…"
          />
          {error && <p className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}
          <Button type="submit" className="w-full">
            Enregistrer la note
          </Button>
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

function TextField({ label, value, onChange, type = "text", required = true, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        required={required}
        step={type === "number" ? "0.25" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus-ring w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none"
      />
    </label>
  );
}
