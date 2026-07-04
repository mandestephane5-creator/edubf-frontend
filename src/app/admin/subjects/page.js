"use client";

import { useEffect, useState } from "react";
import { PageHeader, DataTable, Button } from "@/components/ui";
import Modal from "@/components/Modal";
import { subjectsApi } from "@/app/api-calls/directory";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "" });
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      setSubjects(await subjectsApi.list());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await subjectsApi.create(form);
      setForm({ name: "", code: "" });
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Matières"
        description="Liste des matières enseignées dans l'école"
        action={<Button onClick={() => setModalOpen(true)}>+ Nouvelle matière</Button>}
      />

      {error && <p className="mb-4 rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : (
        <DataTable columns={[{ key: "name", header: "Matière" }, { key: "code", header: "Code" }]} rows={subjects} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle matière">
        <form onSubmit={handleCreate} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Nom</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="focus-ring w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Code (optionnel)</span>
            <input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              className="focus-ring w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
          {error && <p className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}
          <Button type="submit" className="w-full">
            Créer la matière
          </Button>
        </form>
      </Modal>
    </div>
  );
}
