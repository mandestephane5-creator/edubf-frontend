"use client";

import { useEffect, useState } from "react";
import { PageHeader, Button, Badge } from "@/components/ui";
import Modal from "@/components/Modal";
import { teachersApi } from "@/app/api-calls/staff";
import { classesApi, subjectsApi } from "@/app/api-calls/directory";

const emptyForm = { email: "", firstName: "", lastName: "", assignments: [] };

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [pendingClassId, setPendingClassId] = useState("");
  const [pendingSubjectId, setPendingSubjectId] = useState("");
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [t, c, s] = await Promise.all([teachersApi.list(), classesApi.list(), subjectsApi.list()]);
      setTeachers(t);
      setClasses(c);
      setSubjects(s);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function addAssignment() {
    if (!pendingClassId || !pendingSubjectId) return;
    if (form.assignments.some((a) => a.classId === pendingClassId && a.subjectId === pendingSubjectId)) return;
    setForm((f) => ({ ...f, assignments: [...f.assignments, { classId: pendingClassId, subjectId: pendingSubjectId }] }));
    setPendingClassId("");
    setPendingSubjectId("");
  }

  function removeAssignment(index) {
    setForm((f) => ({ ...f, assignments: f.assignments.filter((_, i) => i !== index) }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      const result = await teachersApi.create(form);
      setCreatedCredentials(result);
      setForm(emptyForm);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleActive(teacher) {
    await teachersApi.setActive(teacher.id, !teacher.isActive);
    load();
  }

  function className(id) {
    return classes.find((c) => c.id === id)?.name ?? "?";
  }
  function subjectName(id) {
    return subjects.find((s) => s.id === id)?.name ?? "?";
  }

  return (
    <div>
      <PageHeader
        title="Professeurs"
        description="Comptes professeur et assignation à leurs classes/matières"
        action={<Button onClick={() => setModalOpen(true)}>+ Nouveau professeur</Button>}
      />

      {error && <p className="mb-4 rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : teachers.length === 0 ? (
        <p className="text-sm text-muted">Aucun professeur pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {teachers.map((t) => (
            <div key={t.id} className="rounded-card border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {t.firstName} {t.lastName}
                  </p>
                  <p className="text-xs text-muted">{t.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge value={t.isActive ? "Actif" : "Désactivé"} />
                  <Button variant="outline" onClick={() => handleToggleActive(t)}>
                    {t.isActive ? "Désactiver" : "Réactiver"}
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {t.assignments.map((a) => (
                  <span key={a.id} className="rounded-pill bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                    {a.className} · {a.subjectName}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau professeur">
        <form onSubmit={handleCreate} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Prénom</span>
            <input
              required
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Nom</span>
            <input
              required
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Email</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink">Classes et matières enseignées</span>
            <div className="flex gap-2">
              <select
                value={pendingClassId}
                onChange={(e) => setPendingClassId(e.target.value)}
                className="focus-ring flex-1 rounded-md border border-border bg-surface px-2 py-2 text-sm outline-none"
              >
                <option value="">Classe…</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={pendingSubjectId}
                onChange={(e) => setPendingSubjectId(e.target.value)}
                className="focus-ring flex-1 rounded-md border border-border bg-surface px-2 py-2 text-sm outline-none"
              >
                <option value="">Matière…</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <Button type="button" variant="outline" onClick={addAssignment}>
                Ajouter
              </Button>
            </div>

            {form.assignments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {form.assignments.map((a, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 rounded-pill bg-primary-soft px-3 py-1 text-xs font-medium text-primary"
                  >
                    {className(a.classId)} · {subjectName(a.subjectId)}
                    <button type="button" onClick={() => removeAssignment(i)} className="text-primary hover:text-rose">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <p className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}
          <Button type="submit" className="w-full" disabled={form.assignments.length === 0}>
            Créer le compte professeur
          </Button>
        </form>
      </Modal>

      {/* Identifiants générés — affichés une seule fois, comme pour les élèves */}
      <Modal open={!!createdCredentials} onClose={() => setCreatedCredentials(null)} title="Compte professeur créé">
        {createdCredentials && (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Communiquez ces identifiants à {createdCredentials.firstName} {createdCredentials.lastName}. Ils ne seront plus
              affichés ensuite.
            </p>
            <div className="rounded-md bg-bg p-3 text-sm">
              <p>
                <span className="font-medium">Email :</span> {createdCredentials.email}
              </p>
              <p>
                <span className="font-medium">Mot de passe :</span> {createdCredentials.tempPassword}
              </p>
            </div>
            <Button className="w-full" onClick={() => setCreatedCredentials(null)}>
              Fermer
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
