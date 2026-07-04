"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, DataTable, Button } from "@/components/ui";
import Modal from "@/components/Modal";
import { classesApi } from "@/app/api-calls/directory";

const emptyForm = { name: "", level: "", academicYear: "2025-2026" };

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      setClasses(await classesApi.list());
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
      await classesApi.create(form);
      setForm(emptyForm);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Classes"
        description="Organisation des classes par année scolaire"
        action={<Button onClick={() => setModalOpen(true)}>+ Nouvelle classe</Button>}
      />

      {error && <p className="mb-4 rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : (
        <DataTable
          columns={[
            { key: "name", header: "Classe" },
            { key: "level", header: "Niveau" },
            { key: "academicYear", header: "Année scolaire" },
            { key: "students", header: "Effectif", render: (r) => r._count?.students ?? 0 },
            { key: "subjects", header: "Matières", render: (r) => r.subjects?.length ?? 0 },
            {
              key: "action",
              header: "",
              render: (r) => (
                <button
                  onClick={() => router.push(`/admin/classes/${r.id}`)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Gérer les matières
                </button>
              ),
            },
          ]}
          rows={classes}
          emptyLabel="Aucune classe créée."
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle classe">
        <form onSubmit={handleCreate} className="space-y-3">
          <TextField label="Nom" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="6e A" />
          <TextField label="Niveau" value={form.level} onChange={(v) => setForm((f) => ({ ...f, level: v }))} placeholder="6e" />
          <TextField
            label="Année scolaire"
            value={form.academicYear}
            onChange={(v) => setForm((f) => ({ ...f, academicYear: v }))}
            placeholder="2025-2026"
          />
          {error && <p className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}
          <Button type="submit" className="w-full">
            Créer la classe
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus-ring w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none"
      />
    </label>
  );
}
