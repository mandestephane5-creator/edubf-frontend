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

/** Transforme un texte libre en identifiant valide : minuscules, tirets, sans accents */
function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les accents (é -> e, etc.)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // tout caractère non autorisé devient un tiret
    .replace(/^-+|-+$/g, ""); // retire les tirets en trop au début/à la fin
}

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [slugTouched, setSlugTouched] = useState(false); // true dès que l'utilisateur modifie le slug lui-même
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  function handleNameChange(e) {
    const name = e.target.value;
    setForm((f) => ({
      ...f,
      schoolName: name,
      // Tant que l'utilisateur n'a pas touché au slug lui-même, on le génère automatiquement
      schoolSlug: slugTouched ? f.schoolSlug : slugify(name),
    }));
  }

  function handleSlugChange(e) {
    setSlugTouched(true);
    setForm((f) => ({ ...f, schoolSlug: slugify(e.target.value) }));
  }

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
      // Affiche le détail précis du champ en erreur plutôt qu'un message générique
      const fieldErrors = err.details?.fieldErrors;
      if (fieldErrors) {
        const firstError = Object.values(fieldErrors).flat()[0];
        setError(firstError || err.message);
      } else {
        setError(err.message || "Impossible de créer l'école");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h1 className="text-lg font-semibold">Créer votre école</h1>
      <p className="mt-1 text-sm text-muted">Un espace Vorelix dédié, en quelques secondes.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Nom de l'école" value={form.schoolName} onChange={handleNameChange} placeholder="Sainte Marie" />
        <Field
          label="Identifiant (slug)"
          value={form.schoolSlug}
          onChange={handleSlugChange}
          placeholder="sainte-marie"
          hint="Généré automatiquement à partir du nom — utilisé pour la connexion"
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
