"use client";

import { useState } from "react";
import { PageHeader, Button } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/app/api-calls/auth";

export default function TeacherProfilePage() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setMessage("Mot de passe modifié avec succès.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Profil" description="Vos informations et vos accès" />

      <div className="mb-6 rounded-card border border-border bg-surface p-4">
        <p className="text-sm font-medium text-ink">{user?.email}</p>
        <p className="text-xs text-muted">Compte professeur</p>
      </div>

      <div className="mb-6 rounded-card border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-medium text-ink">Changer le mot de passe</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Mot de passe actuel</span>
            <input
              required
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="focus-ring w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Nouveau mot de passe</span>
            <input
              required
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="focus-ring w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Confirmer le nouveau mot de passe</span>
            <input
              required
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="focus-ring w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none"
            />
          </label>
          {message && <p className="rounded-md bg-emerald-soft px-3 py-2 text-sm text-emerald">{message}</p>}
          {error && <p className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement…" : "Modifier le mot de passe"}
          </Button>
        </form>
      </div>

      <Button variant="outline" onClick={logout}>
        Déconnexion
      </Button>
    </div>
  );
}
