"use client";

import { useEffect, useState } from "react";
import { PageHeader, DataTable, Button } from "@/components/ui";
import Modal from "@/components/Modal";
import { useAuth } from "@/context/AuthContext";
import { schoolApi } from "@/app/api-calls/directory";

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [settings, setSettings] = useState(null);
  const [surveillants, setSurveillants] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "" });
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  useEffect(() => {
    schoolApi.getSettings().then(setSettings).catch((err) => setError(err.message));
    if (isAdmin) {
      schoolApi.listSurveillants().then(setSurveillants).catch((err) => setError(err.message));
    }
  }, [isAdmin]);

  async function handleSaveSettings(e) {
    e.preventDefault();
    setError("");
    try {
      const updated = await schoolApi.updateSettings({
        name: settings.name,
        city: settings.city,
        phone: settings.phone,
        publicWebsiteUrl: settings.publicWebsiteUrl || "",
      });
      setSettings(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateSurveillant(e) {
    e.preventDefault();
    setError("");
    try {
      const result = await schoolApi.createSurveillant(form);
      setSuccessInfo({ email: result.user.email, password: result.temporaryPassword });
      setForm({ email: "", firstName: "", lastName: "" });
      setModalOpen(false);
      schoolApi.listSurveillants().then(setSurveillants);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeactivate(id) {
    if (!confirm("Désactiver ce compte surveillant ?")) return;
    try {
      await schoolApi.deactivateSurveillant(id);
      schoolApi.listSurveillants().then(setSurveillants);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!settings) return <p className="text-sm text-muted">Chargement…</p>;

  return (
    <div>
      <PageHeader title="Paramètres" description="Informations de l'école" />

      {error && <p className="mb-4 rounded-lg bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      <form onSubmit={handleSaveSettings} className="mb-8 max-w-md space-y-3 rounded-card border border-border bg-surface p-5 shadow-card">
        <Field label="Nom de l'école" value={settings.name} onChange={(v) => setSettings((s) => ({ ...s, name: v }))} disabled={!isAdmin} />
        <Field label="Ville" value={settings.city || ""} onChange={(v) => setSettings((s) => ({ ...s, city: v }))} disabled={!isAdmin} />
        <Field label="Téléphone" value={settings.phone || ""} onChange={(v) => setSettings((s) => ({ ...s, phone: v }))} disabled={!isAdmin} />
        <Field
          label="Site web de l'école (affiché dans l'app mobile)"
          value={settings.publicWebsiteUrl || ""}
          onChange={(v) => setSettings((s) => ({ ...s, publicWebsiteUrl: v }))}
          placeholder="https://www.saintemarie.bf"
          disabled={!isAdmin}
        />
        {isAdmin && <Button type="submit">Enregistrer</Button>}
      </form>

      {isAdmin && (
        <>
          <PageHeader
            title="Comptes surveillant"
            description="Gestion du personnel"
            action={<Button onClick={() => setModalOpen(true)}>+ Nouveau surveillant</Button>}
          />

          {successInfo && (
            <p className="mb-4 rounded-lg bg-emerald-soft px-3 py-2 text-sm text-emerald">
              Compte créé pour {successInfo.email}. Mot de passe temporaire : <span className="font-mono">{successInfo.password}</span>
            </p>
          )}

          <DataTable
            columns={[
              { key: "email", header: "Email" },
              { key: "status", header: "Statut", render: (r) => (r.isActive ? "Actif" : "Désactivé") },
              {
                key: "action",
                header: "",
                render: (r) =>
                  r.isActive && (
                    <button onClick={() => handleDeactivate(r.id)} className="text-sm font-medium text-rose hover:underline">
                      Désactiver
                    </button>
                  ),
              },
            ]}
            rows={surveillants}
            emptyLabel="Aucun compte surveillant."
          />

          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau surveillant">
            <form onSubmit={handleCreateSurveillant} className="space-y-3">
              <Field label="Prénom" value={form.firstName} onChange={(v) => setForm((f) => ({ ...f, firstName: v }))} />
              <Field label="Nom" value={form.lastName} onChange={(v) => setForm((f) => ({ ...f, lastName: v }))} />
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
              {error && <p className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}
              <Button type="submit" className="w-full">Créer le compte</Button>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, disabled }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="focus-ring w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none disabled:bg-bg disabled:text-muted"
      />
    </label>
  );
}
