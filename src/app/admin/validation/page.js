"use client";

import { useEffect, useState } from "react";
import { PageHeader, Badge, Button } from "@/components/ui";
import Modal from "@/components/Modal";
import { validationApi } from "@/app/api-calls/staff";

export default function ValidationPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [detail, setDetail] = useState(null);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      setPending(await validationApi.listPendingByClass());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openDetail(classItem) {
    setSelectedClass(classItem);
    setDetail(await validationApi.getPendingDetail(classItem.classId));
  }

  async function handleValidate() {
    if (!selectedClass) return;
    setValidating(true);
    try {
      await validationApi.validateClass(selectedClass.classId);
      setSelectedClass(null);
      setDetail(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setValidating(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Validation"
        description="Valide les notes et incidents saisis par les professeurs, classe par classe"
      />

      {error && <p className="mb-4 rounded-md bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : (
        <div className="space-y-2">
          {pending.map((c) => (
            <div
              key={c.classId}
              className={`flex items-center justify-between gap-3 rounded-card border p-4 ${
                c.hasPending ? "border-amber bg-amber-soft/40" : "border-border bg-surface"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-ink">{c.className}</p>
                {c.hasPending ? (
                  <p className="text-xs text-muted">
                    {c.gradesCount > 0 && `${c.gradesCount} note(s)`}
                    {c.gradesCount > 0 && c.incidentsCount > 0 && " · "}
                    {c.incidentsCount > 0 && `${c.incidentsCount} incident(s)`}
                    {c.subjects.length > 0 && ` (${c.subjects.join(", ")})`} — soumis par {c.teachers.join(", ")}
                  </p>
                ) : (
                  <p className="text-xs text-muted">Aucune soumission en attente</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge value={c.hasPending ? "En attente" : "À jour"} />
                {c.hasPending && (
                  <Button variant="outline" onClick={() => openDetail(c)}>
                    Examiner
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selectedClass} onClose={() => setSelectedClass(null)} title={`Valider ${selectedClass?.className ?? ""}`}>
        {detail && (
          <div className="space-y-4">
            {detail.grades.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-ink">Notes ({detail.grades.length})</p>
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {detail.grades.map((g) => (
                    <div key={g.id} className="flex justify-between rounded-md bg-bg px-3 py-2 text-xs">
                      <span>
                        {g.student.firstName} {g.student.lastName} — {g.subject.name} ({g.label})
                      </span>
                      <span className="font-medium">
                        {g.value}/{g.maxValue}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {detail.incidents.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-ink">Incidents ({detail.incidents.length})</p>
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {detail.incidents.map((i) => (
                    <div key={i.id} className="flex justify-between rounded-md bg-bg px-3 py-2 text-xs">
                      <span>
                        {i.student.firstName} {i.student.lastName}
                      </span>
                      <Badge value={i.type} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button className="w-full" onClick={handleValidate} disabled={validating}>
              {validating ? "Validation…" : `Valider toute la classe`}
            </Button>
            <p className="text-center text-xs text-muted">Les parents seront notifiés immédiatement après validation.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
