"use client";

import { useEffect, useState } from "react";
import { PageHeader, DataTable, Badge } from "@/components/ui";
import { reportsApi } from "@/app/api-calls/misc";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      setReports(await reportsApi.list());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleResolve(id) {
    try {
      await reportsApi.markResolved(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader title="Signalements" description="Problèmes signalés par les parents depuis l'application mobile" />

      {error && <p className="mb-4 rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : (
        <DataTable
          columns={[
            { key: "parent", header: "Parent", render: (r) => r.user.phone || r.user.email || "—" },
            { key: "message", header: "Message" },
            { key: "date", header: "Date", render: (r) => new Date(r.createdAt).toLocaleDateString("fr-FR") },
            { key: "status", header: "Statut", render: (r) => <Badge value={r.resolved ? "Traité" : "EN_ATTENTE"} /> },
            {
              key: "action",
              header: "",
              render: (r) =>
                !r.resolved && (
                  <button onClick={() => handleResolve(r.id)} className="text-sm font-medium text-primary hover:underline">
                    Marquer comme traité
                  </button>
                ),
            },
          ]}
          rows={reports}
          emptyLabel="Aucun signalement pour le moment."
        />
      )}
    </div>
  );
}
