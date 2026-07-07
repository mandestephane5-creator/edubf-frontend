"use client";

import { useEffect, useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import { PageHeader, Button } from "@/components/ui";
import Modal from "@/components/Modal";
import { classesApi } from "@/app/api-calls/directory";
import { studentsApi } from "@/app/api-calls/students";
import { gradesApi } from "@/app/api-calls/academic";

const TERMS = [
  { value: "TRIMESTRE_1", label: "Trimestre 1" },
  { value: "TRIMESTRE_2", label: "Trimestre 2" },
  { value: "TRIMESTRE_3", label: "Trimestre 3" },
];

// Séquence utilisée pour passer automatiquement à l'évaluation suivante après enregistrement
const LABEL_SEQUENCE = ["Devoir 1", "Devoir 2", "Composition"];

export default function GradesPage() {
  const [classes, setClasses] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [existingGrades, setExistingGrades] = useState([]);

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [term, setTerm] = useState("TRIMESTRE_1");
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [label, setLabel] = useState("Devoir 1");

  const [draft, setDraft] = useState({}); // { studentId: "note tapée" }
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(null); // { done, total }
  const [savedCount, setSavedCount] = useState(null);
  const [error, setError] = useState("");

  const [editingGrade, setEditingGrade] = useState(null); // note en cours de modification
  const [editValue, setEditValue] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const [auditLog, setAuditLog] = useState([]);
  const [showAuditLog, setShowAuditLog] = useState(false);

  useEffect(() => {
    classesApi.list().then(setClasses);
  }, []);

  // Matières + coefficients propres à la classe choisie
  useEffect(() => {
    if (!classId) {
      setClassSubjects([]);
      setSubjectId("");
      return;
    }
    classesApi.getById(classId).then((c) => setClassSubjects(c.subjects));
  }, [classId]);

  // Élèves de la classe + notes déjà existantes pour ces filtres (classe+matière+trimestre+année)
  async function loadGridData() {
    if (!classId || !subjectId) {
      setStudents([]);
      setExistingGrades([]);
      return;
    }
    try {
      const [s, g] = await Promise.all([
        studentsApi.list({ classId }),
        gradesApi.list({ classId, subjectId, term, academicYear }),
      ]);
      setStudents(s);
      setExistingGrades(g);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadGridData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, subjectId, term, academicYear]);

  // Pré-remplit la grille avec les notes déjà saisies pour CE libellé précis
  useEffect(() => {
    const prefill = {};
    for (const g of existingGrades) {
      if (g.label === label) prefill[g.student.id] = String(g.value);
    }
    setDraft(prefill);
    setSavedCount(null);
  }, [existingGrades, label]);

  const currentCoefficient = classSubjects.find((cs) => cs.subject.id === subjectId)?.coefficient ?? 1;

  // Enregistrement PARALLÈLE (toutes les requêtes en même temps, pas les unes après les
  // autres) — nettement plus rapide pour une classe de 30 élèves qu'un envoi séquentiel.
  async function handleSaveGrid() {
    setError("");
    setSaving(true);

    const toSave = students
      .map((student) => {
        const rawValue = draft[student.id];
        if (rawValue === undefined || rawValue === "") return null;
        const numericValue = Number(rawValue);
        if (Number.isNaN(numericValue)) return null;
        const existing = existingGrades.find((g) => g.student.id === student.id && g.label === label);
        if (existing && existing.value === numericValue) return null; // rien à changer
        return { student, numericValue, existing };
      })
      .filter(Boolean);

    setSaveProgress({ done: 0, total: toSave.length });

    try {
      let done = 0;
      await Promise.all(
        toSave.map(async ({ student, numericValue, existing }) => {
          if (existing) {
            await gradesApi.update(existing.id, { value: numericValue });
          } else {
            await gradesApi.create({
              studentId: student.id,
              classId,
              subjectId,
              value: numericValue,
              coefficient: currentCoefficient,
              term,
              academicYear,
              label,
            });
          }
          done++;
          setSaveProgress({ done, total: toSave.length });
        })
      );

      setSavedCount(toSave.length);
      loadGridData();

      // Passe automatiquement à l'évaluation suivante (Devoir 1 → Devoir 2 → Composition)
      const currentIndex = LABEL_SEQUENCE.indexOf(label);
      if (currentIndex !== -1 && currentIndex < LABEL_SEQUENCE.length - 1) {
        setLabel(LABEL_SEQUENCE[currentIndex + 1]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setSaveProgress(null);
    }
  }

  async function loadAuditLog() {
    try {
      setAuditLog(await gradesApi.auditLog());
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEditGrade(e) {
    e.preventDefault();
    setError("");
    const numericValue = Number(editValue);
    if (Number.isNaN(numericValue) || numericValue < 0) {
      setError("Note invalide");
      return;
    }
    setEditSaving(true);
    try {
      await gradesApi.update(editingGrade.id, { value: numericValue });
      setEditingGrade(null);
      loadGridData();
      if (showAuditLog) loadAuditLog();
    } catch (err) {
      setError(err.message);
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDeleteGrade(gradeId) {
    if (!confirm("Supprimer cette note ?")) return;
    try {
      await gradesApi.remove(gradeId);
      loadGridData();
      if (showAuditLog) loadAuditLog();
    } catch (err) {
      setError(err.message);
    }
  }

  const filledCount = Object.values(draft).filter((v) => v !== "" && v !== undefined).length;

  return (
    <div>
      <PageHeader title="Notes" description="Saisie rapide par classe et par matière, pour tous les élèves à la fois" />

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <Select label="Classe" value={classId} onChange={setClassId} placeholder="Choisir une classe">
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <Select
          label="Matière"
          value={subjectId}
          onChange={setSubjectId}
          placeholder={classSubjects.length === 0 ? "Choisir une classe d'abord" : "Choisir une matière"}
        >
          {classSubjects.map((cs) => (
            <option key={cs.subject.id} value={cs.subject.id}>{cs.subject.name} (coef. {cs.coefficient})</option>
          ))}
        </Select>
        <Select label="Trimestre" value={term} onChange={setTerm}>
          {TERMS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>
        <TextField label="Année scolaire" value={academicYear} onChange={setAcademicYear} />
        <TextField label="Libellé de l'évaluation" value={label} onChange={setLabel} placeholder="Devoir 1, Composition…" />
      </div>

      {error && <p className="mb-4 rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      {classId && classSubjects.length === 0 && (
        <p className="mb-4 rounded-md bg-amber-soft px-3 py-2 text-sm text-amber">
          Cette classe n'a pas encore de matière assignée. Va dans{" "}
          <a href={`/admin/classes/${classId}`} className="underline">Classes → Gérer les matières</a> pour en ajouter.
        </p>
      )}

      {!classId || !subjectId ? (
        <p className="text-sm text-muted">Choisis une classe et une matière pour afficher la grille de saisie.</p>
      ) : students.length === 0 ? (
        <p className="text-sm text-muted">Aucun élève dans cette classe.</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">#</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">Élève</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">Note ({label || "—"}) / 20</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 text-muted">{i + 1}</td>
                    <td className="px-4 py-2.5 text-ink">{s.firstName} {s.lastName}</td>
                    <td className="px-4 py-2.5">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.25"
                        value={draft[s.id] ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, [s.id]: e.target.value }))}
                        placeholder="—"
                        className="focus-ring w-20 rounded-md border border-border bg-surface px-2 py-1.5 text-sm outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button onClick={handleSaveGrid} disabled={saving || filledCount === 0}>
              {saving ? "Enregistrement…" : `Enregistrer ${filledCount > 0 ? `(${filledCount})` : ""}`}
            </Button>
            {saveProgress && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${saveProgress.total > 0 ? (saveProgress.done / saveProgress.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-muted">{saveProgress.done}/{saveProgress.total}</span>
              </div>
            )}
            {savedCount !== null && !saveProgress && (
              <p className="text-sm text-emerald">{savedCount} note(s) enregistrée(s) ou mise(s) à jour.</p>
            )}
          </div>

          {existingGrades.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-ink">Notes déjà enregistrées pour ces filtres</h2>
              <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">Élève</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">Libellé</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">Note</th>
                      <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">Saisie par</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingGrades.map((g) => (
                      <tr key={g.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-2.5">{g.student.firstName} {g.student.lastName}</td>
                        <td className="px-4 py-2.5 text-muted">{g.label || "—"}</td>
                        <td className="px-4 py-2.5 font-mono">{g.value}/{g.maxValue}</td>
                        <td className="px-4 py-2.5 text-xs text-muted">{g.enteredBy?.email || "—"}</td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => { setEditingGrade(g); setEditValue(String(g.value)); }}
                              className="text-primary hover:opacity-70"
                              aria-label="Modifier"
                            >
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => handleDeleteGrade(g.id)} className="text-rose hover:opacity-70" aria-label="Supprimer">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={!!editingGrade} onClose={() => setEditingGrade(null)} title="Modifier la note">
        {editingGrade && (
          <form onSubmit={handleEditGrade} className="space-y-4">
            <p className="text-sm text-muted">
              {editingGrade.student.firstName} {editingGrade.student.lastName} — {editingGrade.label || "Note"}
            </p>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Nouvelle note (/ {editingGrade.maxValue})</span>
              <input
                type="number"
                min="0"
                max={editingGrade.maxValue}
                step="0.25"
                required
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
              />
            </label>
            {error && <p className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}
            <Button type="submit" className="w-full" disabled={editSaving}>
              {editSaving ? "Enregistrement…" : "Enregistrer la modification"}
            </Button>
          </form>
        )}
      </Modal>

      <div className="mt-10 border-t border-border pt-6">
        <button
          onClick={() => { setShowAuditLog((v) => !v); if (!showAuditLog) loadAuditLog(); }}
          className="text-sm font-medium text-primary hover:underline"
        >
          {showAuditLog ? "Masquer" : "Voir"} l'historique des modifications de notes
        </button>
        {showAuditLog && (
          <div className="mt-4 overflow-hidden rounded-card border border-border bg-surface shadow-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">Élève</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">Matière</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">Action</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">Valeur</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">Par</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">Quand</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted">Aucune modification enregistrée.</td>
                  </tr>
                ) : (
                  auditLog.map((log) => (
                    <tr key={log.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5">{log.studentName}</td>
                      <td className="px-4 py-2.5 text-muted">{log.subjectName}</td>
                      <td className="px-4 py-2.5">
                        {log.action === "deleted" ? (
                          <span className="text-rose">Supprimée</span>
                        ) : (
                          <span className="text-amber">Modifiée</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs">
                        {log.oldValue}{log.newValue !== null ? ` → ${log.newValue}` : ""}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted">{log.performedBy?.email || "—"}</td>
                      <td className="px-4 py-2.5 text-xs text-muted">{new Date(log.createdAt).toLocaleString("fr-FR")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
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

function TextField({ label, value, onChange, placeholder }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus-ring rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
      />
    </label>
  );
}
