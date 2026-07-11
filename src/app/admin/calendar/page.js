"use client";

import { useEffect, useState } from "react";
import { PageHeader, Button } from "@/components/ui";
import Modal from "@/components/Modal";
import { calendarApi } from "@/app/api-calls/staff";

const emptyForm = { title: "", description: "", date: "", endDate: "" };

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      setEvents(await calendarApi.list());
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
      await calendarApi.create({ ...form, endDate: form.endDate || undefined });
      setForm(emptyForm);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    await calendarApi.remove(id);
    load();
  }

  const upcoming = events.filter((e) => new Date(e.date) >= new Date(new Date().toDateString()));
  const past = events.filter((e) => new Date(e.date) < new Date(new Date().toDateString()));

  return (
    <div>
      <PageHeader
        title="Calendrier"
        description="Réunions, vacances, jours fériés et autres événements de l'école"
        action={<Button onClick={() => setModalOpen(true)}>+ Nouvel événement</Button>}
      />

      {error && <p className="mb-4 rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : (
        <>
          <p className="mb-2 text-sm font-medium text-ink">À venir</p>
          {upcoming.length === 0 ? (
            <p className="mb-4 text-sm text-muted">Aucun événement à venir.</p>
          ) : (
            <div className="mb-6 space-y-2">
              {upcoming.map((e) => (
                <EventRow key={e.id} event={e} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {past.length > 0 && (
            <>
              <p className="mb-2 text-sm font-medium text-muted">Passés</p>
              <div className="space-y-2 opacity-60">
                {past.map((e) => (
                  <EventRow key={e.id} event={e} onDelete={handleDelete} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvel événement">
        <form onSubmit={handleCreate} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Titre</span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Description (optionnel)</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Date</span>
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Date de fin (optionnel, ex: vacances)</span>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
            />
          </label>
          {error && <p className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}
          <Button type="submit" className="w-full">
            Créer l'événement
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function EventRow({ event, onDelete }) {
  return (
    <div className="flex items-center justify-between rounded-card border border-border bg-surface p-3">
      <div>
        <p className="text-sm font-medium text-ink">{event.title}</p>
        <p className="text-xs text-muted">
          {new Date(event.date).toLocaleDateString("fr-FR")}
          {event.endDate && ` → ${new Date(event.endDate).toLocaleDateString("fr-FR")}`}
          {event.description && ` — ${event.description}`}
        </p>
      </div>
      <button onClick={() => onDelete(event.id)} className="text-xs text-rose hover:underline">
        Supprimer
      </button>
    </div>
  );
}
