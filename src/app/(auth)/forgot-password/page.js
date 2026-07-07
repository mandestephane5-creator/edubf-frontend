"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/app/api-calls/auth";

export default function ForgotPasswordPage() {
  const [schoolSlug, setSchoolSlug] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await authApi.forgotPassword(schoolSlug.trim(), email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h1 className="text-lg font-semibold">Mot de passe oublié</h1>
      <p className="mt-1 text-sm text-muted">Un lien de réinitialisation vous sera envoyé par email.</p>

      {sent ? (
        <p className="mt-6 rounded-md bg-emerald-soft px-3 py-2 text-sm text-emerald">
          Si ce compte existe, un email contenant un lien de réinitialisation a été envoyé.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Identifiant de l'école</span>
            <input
              required
              value={schoolSlug}
              onChange={(e) => setSchoolSlug(e.target.value)}
              placeholder="sainte-marie"
              className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@saintemarie.bf"
              className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
            />
          </label>
          {error && <p className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="focus-ring w-full rounded-md bg-primary py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {submitting ? "Envoi…" : "Envoyer le lien"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
