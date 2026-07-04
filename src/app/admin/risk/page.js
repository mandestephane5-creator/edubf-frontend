"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { PageHeader, DataTable } from "@/components/ui";
import { riskApi } from "@/app/api-calls/misc";

const TERM = "TRIMESTRE_1";
const ACADEMIC_YEAR = "2025-2026";

export default function RiskPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    riskApi
      .list(TERM, ACADEMIC_YEAR)
      .then(setStudents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Élèves à risque"
        description="5 absences ou plus ce mois-ci, ou moyenne générale inférieure à 8/20"
      />

      {error && <p className="mb-4 rounded-lg bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : (
        <DataTable
          columns={[
            {
              key: "student",
              header: "Élève",
              render: (r) => (
                <span className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-rose" />
                  {r.firstName} {r.lastName}
                </span>
              ),
            },
            { key: "class", header: "Classe", render: (r) => r.className },
            { key: "absences", header: "Absences (mois)", render: (r) => r.absencesCount },
            { key: "average", header: "Moyenne", render: (r) => (r.average > 0 ? `${r.average}/20` : "—") },
            { key: "reasons", header: "Raison(s)", render: (r) => r.reasons.join(" · ") },
          ]}
          rows={students}
          emptyLabel="Aucun élève signalé à risque pour le moment."
        />
      )}
    </div>
  );
}
