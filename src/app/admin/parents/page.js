"use client";

import { useEffect, useState } from "react";
import { PageHeader, DataTable, Button } from "@/components/ui";
import { parentsApi } from "@/app/api-calls/directory";

export default function ParentsPage() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resetInfo, setResetInfo] = useState(null);

  async function load() {
    setLoading(true);
    try {
      setParents(await parentsApi.list());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleReset(parent) {
    if (!confirm(`Réinitialiser le mot de passe de ${parent.firstName} ${parent.lastName} ?`)) return;
    try {
      const result = await parentsApi.resetPassword(parent.id);
      setResetInfo({ name: `${parent.firstName} ${parent.lastName}`, newPin: result.newPin });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader title="Parents" description="Comptes des parents et tuteurs" />

      {resetInfo && (
        <p className="mb-4 rounded-lg bg-emerald-soft px-3 py-2 text-sm text-emerald">
          Nouveau mot de passe pour {resetInfo.name} : <span className="font-mono">{resetInfo.newPin}</span> — transmettez-le au parent.
        </p>
      )}
      {error && <p className="mb-4 rounded-lg bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : (
        <DataTable
          columns={[
            { key: "name", header: "Nom", render: (r) => `${r.firstName} ${r.lastName}` },
            { key: "phone", header: "Téléphone", render: (r) => r.user?.phone || "—" },
            { key: "children", header: "Enfants", render: (r) => r.children?.map((c) => c.student.firstName).join(", ") || "—" },
            {
              key: "action",
              header: "",
              render: (r) => (
                <button onClick={() => handleReset(r)} className="text-sm font-medium text-primary hover:underline">
                  Réinitialiser le mot de passe
                </button>
              ),
            },
          ]}
          rows={parents}
          emptyLabel="Aucun parent enregistré."
        />
      )}
    </div>
  );
}
