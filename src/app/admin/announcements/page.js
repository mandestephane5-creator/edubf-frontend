"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { PageHeader, Button } from "@/components/ui";
import Modal from "@/components/Modal";
import { announcementsApi } from "@/app/api-calls/misc";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", message: "" });
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      setAnnouncements(await announcementsApi.list());
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
      await announcementsApi.create(form);
      setForm({ title: "", message: "" });
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer cette annonce ?")) return;
    try {
      await announcementsApi.remove(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Annonces"
        description="Actualités envoyées à tous les parents de l'école (notification + push)"
        action={<Button onClick={() => setModalOpen(true)}>+ Nouvelle annonce</Button>}
      />

      {error && <p className="mb-4 rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : announcements.length === 0 ? (
        <div className="rounded-card border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
          Aucune annonce publiée pour le moment.
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-4 rounded-card border border-border bg-surface p-4 shadow-card">
              <div>
                <p className="font-medium text-ink">{a.title}</p>
                <p className="mt-1 text-sm text-muted">{a.message}</p>
                <p className="mt-2 text-xs text-muted">{new Date(a.createdAt).toLocaleString("fr-FR")}</p>
              </div>
              <button onClick={() => handleDelete(a.id)} className="text-rose hover:opacity-70" aria-label="Supprimer">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle annonce">
        <form onSubmit={handleCreate} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Titre</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Rentrée scolaire, réunion parents-professeurs…"
              className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Message</span>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
            />
          </label>
          <p className="text-xs text-muted">Sera envoyée immédiatement à tous les parents (notification + push).</p>
          {error && <p className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}
          <Button type="submit" className="w-full">Publier</Button>
        </form>
      </Modal>
    </div>
  );
}
