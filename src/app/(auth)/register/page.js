"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/app/api-calls/auth";

const initialForm = {
  schoolName: "",
  schoolSlug: "",
  adminEmail: "",
  adminPassword: "",
  city: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await authApi.registerSchool(form);
      authApi.saveSession(data);
      router.push("/admin");
    } catch (err) {
      setError(err.message || "Impossible de créer l'école");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h1 className="text-lg font-semibold">Créer votre école</h1>
      <p className="mt-1 text-sm text-muted">Un espace Vorelix dédié, en quelques secondes.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Nom de l'école" value={form.schoolName} onChange={set("schoolName")} placeholder="Sainte Marie" />
        <Field
          label="Identifiant (slug)"
          value={form.schoolSlug}
          onChange={set("schoolSlug")}
          placeholder="sainte-marie"
          hint="Utilisé pour la connexion — minuscules, chiffres, tirets uniquement"
        />
        <Field label="Email admin (directrice)" type="email" value={form.adminEmail} onChange={set("adminEmail")} />
        <Field
          label="Mot de passe"
          type="password"
          value={form.adminPassword}
          onChange={set("adminPassword")}
          hint="8 caractères minimum, avec lettres et chiffres"
        />
        <Field label="Ville" value={form.city} onChange={set("city")} placeholder="Ouagadougou" required={false} />

        {error && <p role="alert" className="rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="focus-ring w-full rounded-md bg-primary py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting ? "Création…" : "Créer mon école"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, hint, required = true }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="focus-ring w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
