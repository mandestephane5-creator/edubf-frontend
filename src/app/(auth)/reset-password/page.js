"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/app/api-calls/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err.message || "Lien invalide ou expiré");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return <p className="text-sm text-rose">Lien de réinitialisation invalide.</p>;
  }

  if (done) {
    return (
      <p className="rounded-md bg-emerald-soft px-3 py-2 text-sm text-emerald">
        Mot de passe mis à jour. Redirection vers la connexion…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Nouveau mot de passe</span>
        <input
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="focus-ring w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none"
        />
      </label>
      {error && <p className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="focus-ring w-full rounded-md bg-primary py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
      >
        {submitting ? "Mise à jour…" : "Mettre à jour le mot de passe"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h1 className="text-lg font-semibold">Nouveau mot de passe</h1>
      <p className="mt-1 text-sm text-muted">8 caractères minimum, avec lettres et chiffres.</p>
      <div className="mt-6">
        <Suspense fallback={<p className="text-sm text-muted">Chargement…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
