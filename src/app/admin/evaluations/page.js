"use client";

import { useEffect, useState } from "react";
import { PageHeader, DataTable, Button } from "@/components/ui";
import Modal from "@/components/Modal";
import { classesApi, subjectsApi } from "@/app/api-calls/directory";
import { evaluationsApi } from "@/app/api-calls/academic";

const TERMS = [
  { value: "TRIMESTRE_1", label: "Trimestre 1" },
  { value: "TRIMESTRE_2", label: "Trimestre 2" },
  { value: "TRIMESTRE_3", label: "Trimestre 3" },
];
const ACADEMIC_YEAR = "2025-2026";

export default function EvaluationsPage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classId, setClassId] = useState("");
  const [term, setTerm] = useState("TRIMESTRE_1");
  const [devoirs, setDevoirs] = useState([]);
  const [compositions, setCompositions] = useState([]);
  const [devoirModalOpen, setDevoirModalOpen] = useState(false);
  const [compoModalOpen, setCompoModalOpen] = useState(false);
  const [devoirForm, setDevoirForm] = useState({ subjectId: "", label: "Devoir 1", date: "" });
  const [compoForm, setCompoForm] = useState({ date: "", label: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      const [c, s] = await Promise.all([classesApi.list(), subjectsApi.list()]);
      setClasses(c);
      setSubjects(s);
    }
    init();
  }, []);

  async function loadCompositions() {
    try {
      setCompositions(await evaluationsApi.listCompositionDates(term, ACADEMIC_YEAR));
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadDevoirs() {
    if (!classId) return;
    try {
      setDevoirs(await evaluationsApi.listForClass(classId, term, ACADEMIC_YEAR));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadCompositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  useEffect(() => {
    loadDevoirs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, term]);

  async function handleCreateDevoir(e) {
    e.preventDefault();
    setError("");
    try {
      await evaluationsApi.createDevoir({ classId, term, academicYear: ACADEMIC_YEAR, ...devoirForm });
      setDevoirForm({ subjectId: "", label: "Devoir 1", date: "" });
      setDevoirModalOpen(false);
      loadDevoirs();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateComposition(e) {
    e.preventDefault();
    setError("");
    try {
      await evaluationsApi.createCompositionDate({ term, academicYear: ACADEMIC_YEAR, ...compoForm });
      setCompoForm({ date: "", label: "" });
      setCompoModalOpen(false);
      loadCompositions();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader title="Calendrier d'évaluations" description="Devoirs par classe et jours de composition" />

      <div className="mb-6 flex flex-wrap gap-3">
        <Select label="Trimestre" value={term} onChange={setTerm}>
          {TERMS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
      </div>

      {error && <p className="mb-4 rounded-lg bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      <div className="mb-8 rounded-card border border-border bg-surface p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Jours de composition (toute l'école)</h2>
          <Button variant="outline" onClick={() => setCompoModalOpen(true)}>+ Ajouter un jour</Button>
        </div>
        {compositions.length === 0 ? (
          <p className="text-sm text-muted">Aucun jour de composition programmé pour ce trimestre.</p>
        ) : (
          <ul className="space-y-1">
            {compositions.map((c) => (
              <li key={c.id} className="text-sm text-ink">
                • {new Date(c.date).toLocaleDateString("fr-FR")} {c.label && `— ${c.label}`}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Select label="Classe (pour les devoirs)" value={classId} onChange={setClassId} placeholder="Choisir une classe">
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Button onClick={() => setDevoirModalOpen(true)} disabled={!classId}>+ Ajouter un devoir</Button>
      </div>

      {!classId ? (
        <p className="text-sm text-muted">Sélectionnez une classe pour voir ses devoirs programmés.</p>
      ) : (
        <DataTable
          columns={[
            { key: "subject", header: "Matière", render: (r) => r.subject.name },
            { key: "label", header: "Type" },
            { key: "date", header: "Date", render: (r) => new Date(r.date).toLocaleDateString("fr-FR") },
          ]}
          rows={devoirs}
          emptyLabel="Aucun devoir programmé pour cette classe."
        />
      )}

      <Modal open={devoirModalOpen} onClose={() => setDevoirModalOpen(false)} title="Ajouter un devoir">
        <form onSubmit={handleCreateDevoir} className="space-y-3">
          <Select label="Matière" value={devoirForm.subjectId} onChange={(v) => setDevoirForm((f) => ({ ...f, subjectId: v }))} placeholder="Choisir une matière">
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Select label="Type" value={devoirForm.label} onChange={(v) => setDevoirForm((f) => ({ ...f, label: v }))}>
            <option value="Devoir 1">Devoir 1</option>
            <option value="Devoir 2">Devoir 2</option>
          </Select>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Date</span>
            <input
              type="date"
              required
              value={devoirForm.date}
              onChange={(e) => setDevoirForm((f) => ({ ...f, date: e.target.value }))}
              className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
            />
          </label>
          {error && <p className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}
          <Button type="submit" className="w-full">Enregistrer</Button>
        </form>
      </Modal>

      <Modal open={compoModalOpen} onClose={() => setCompoModalOpen(false)} title="Ajouter un jour de composition">
        <form onSubmit={handleCreateComposition} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Date</span>
            <input
              type="date"
              required
              value={compoForm.date}
              onChange={(e) => setCompoForm((f) => ({ ...f, date: e.target.value }))}
              className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Note (optionnel)</span>
            <input
              value={compoForm.label}
              onChange={(e) => setCompoForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="Ex: Composition du 1er trimestre"
              className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
            />
          </label>
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
        className="focus-ring rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
    </label>
  );
}
