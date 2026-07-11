"use client";

import { useEffect, useState } from "react";
import { PageHeader, Button } from "@/components/ui";
import { classesApi } from "@/app/api-calls/directory";
import { attendanceApi } from "@/app/api-calls/staff";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendancePage() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(todayIso());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    classesApi.list().then((list) => {
      setClasses(list);
      if (list[0]) setClassId(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (!classId) return;
    setLoading(true);
    setSavedMessage("");
    attendanceApi
      .getForClassAndDate(classId, date)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [classId, date]);

  function setPresent(studentId, present) {
    setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, present } : r)));
  }

  function markAllPresent() {
    setRows((prev) => prev.map((r) => ({ ...r, present: true })));
  }
  // Note : "present: true" est déjà la valeur par défaut de chaque ligne désormais —
  // ce bouton sert seulement à annuler des absences déjà cochées par erreur.

  async function handleSave() {
    setSaving(true);
    setSavedMessage("");
    try {
      const records = rows.filter((r) => r.present !== null).map((r) => ({ studentId: r.studentId, present: r.present }));
      await attendanceApi.mark({ classId, date, records });
      setSavedMessage("Présences enregistrées.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Présences" description="Registre de présence quotidien, classe par classe" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="focus-ring rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="focus-ring rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none"
        />
        <Button variant="outline" onClick={markAllPresent}>
          Tout marquer présent
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Chargement…</p>
      ) : (
        <div className="space-y-1">
          {rows.map((r) => (
            <div key={r.studentId} className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2">
              <span className="text-sm text-ink">
                {r.firstName} {r.lastName}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPresent(r.studentId, true)}
                  className={`rounded-md px-3 py-1 text-xs font-medium ${
                    r.present === true ? "bg-emerald text-white" : "border border-border text-muted"
                  }`}
                >
                  Présent
                </button>
                <button
                  onClick={() => setPresent(r.studentId, false)}
                  className={`rounded-md px-3 py-1 text-xs font-medium ${
                    r.present === false ? "bg-rose text-white" : "border border-border text-muted"
                  }`}
                >
                  Absent
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {savedMessage && <p className="mt-3 rounded-md bg-emerald-soft px-3 py-2 text-sm text-emerald">{savedMessage}</p>}

      <div className="mt-4">
        <Button onClick={handleSave} disabled={saving || rows.length === 0}>
          {saving ? "Enregistrement…" : "Enregistrer les présences"}
        </Button>
      </div>
    </div>
  );
}
