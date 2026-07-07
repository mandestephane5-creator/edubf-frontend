"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [schoolSlug, setSchoolSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(schoolSlug.trim(), email.trim(), password);
    } catch (err) {
      setError(err.message || "Connexion impossible");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h1 className="text-lg font-semibold">Connexion</h1>
      <p className="mt-1 text-sm text-muted">Espace réservé à l'administration et aux surveillants.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Identifiant de l'école" value={schoolSlug} onChange={setSchoolSlug} placeholder="sainte-marie" />
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="vous@saintemarie.bf" />
        <Field label="Mot de passe" type="password" value={password} onChange={setPassword} />

        {error && <p role="alert" className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="focus-ring w-full rounded-md bg-primary py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Mot de passe oublié ?
        </Link>
        <Link href="/register" className="text-primary hover:underline">
          Créer une école
        </Link>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
      />
    </label>
  );
}
