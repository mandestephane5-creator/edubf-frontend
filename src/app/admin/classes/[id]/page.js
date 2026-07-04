"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { PageHeader, Button } from "@/components/ui";
import { classesApi, subjectsApi } from "@/app/api-calls/directory";

export default function ClassDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [cls, setCls] = useState(null);
  const [allSubjects, setAllSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [coefficient, setCoefficient] = useState("1");
  const [error, setError] = useState("");

  async function load() {
    try {
      const [c, s] = await Promise.all([classesApi.getById(id), subjectsApi.list()]);
      setCls(c);
      setAllSubjects(s);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAssign(e) {
    e.preventDefault();
    setError("");
    try {
      await classesApi.assignSubject(id, { subjectId, coefficient: Number(coefficient) });
      setSubjectId("");
      setCoefficient("1");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(subjId) {
    if (!confirm("Retirer cette matière de la classe ?")) return;
    try {
      await classesApi.removeSubject(id, subjId);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!cls) return <p className="text-sm text-muted">Chargement…</p>;

  const assignedIds = cls.subjects.map((cs) => cs.subject.id);
  const availableSubjects = allSubjects.filter((s) => !assignedIds.includes(s.id));

  return (
    <div>
      <button
        onClick={() => router.push("/admin/classes")}
        className="focus-ring mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft size={15} /> Retour aux classes
      </button>

      <PageHeader
        title={cls.name}
        description={`${cls.level} — ${cls.academicYear} — matières et coefficients propres à cette classe`}
      />

      {error && <p className="mb-4 rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      <div className="mb-6 overflow-hidden rounded-card border border-border bg-surface shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">Matière</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">Coefficient</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {cls.subjects.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-sm text-muted">
                  Aucune matière assignée à cette classe pour le moment.
                </td>
              </tr>
            ) : (
              cls.subjects.map((cs) => (
                <tr key={cs.subject.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{cs.subject.name}</td>
                  <td className="px-4 py-3 font-mono">{cs.coefficient}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleRemove(cs.subject.id)} className="text-rose hover:opacity-70" aria-label="Retirer">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="max-w-md rounded-card border border-border bg-surface p-5 shadow-card">
        <h2 className="mb-3 text-sm font-semibold text-ink">Ajouter une matière à cette classe</h2>
        <form onSubmit={handleAssign} className="flex items-end gap-3">
          <label className="flex-1 text-sm">
            <span className="mb-1.5 block font-medium text-ink">Matière</span>
            <select
              required
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="focus-ring w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">Choisir…</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="w-24 text-sm">
            <span className="mb-1.5 block font-medium text-ink">Coef.</span>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="10"
              required
              value={coefficient}
              onChange={(e) => setCoefficient(e.target.value)}
              className="focus-ring w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
          <Button type="submit" disabled={!subjectId}>Ajouter</Button>
        </form>
      </div>
    </div>
  );
}
