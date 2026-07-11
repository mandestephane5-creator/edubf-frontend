"use client";

import { useEffect, useState } from "react";
import { PageHeader, Button } from "@/components/ui";
import { teachersApi, attendanceApi } from "@/app/api-calls/staff";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function TeacherAttendancePage() {
  const [assignments, setAssignments] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [date, setDate] = useState(todayIso());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    teachersApi.myAssignments().then((list) => {
      const uniqueClasses = [];
      const seen = new Set();
      for (const a of list) {
        if (!seen.has(a.classId)) {
          seen.add(a.classId);
          uniqueClasses.push(a);
        }
      }
      setAssignments(uniqueClasses);
      setLoading(false);
    });
  }, []);

  const active = assignments[activeIndex];

  useEffect(() => {
    if (!active) return;
    setSavedMessage("");
    attendanceApi.getForClassAndDate(active.classId, date).then(setRows);
  }, [active?.classId, date]);

  function setPresent(studentId, present) {
    setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, present } : r)));
  }

  function markAllPresent() {
    setRows((prev) => prev.map((r) => ({ ...r, present: true })));
  }

  async function handleSave() {
    setSaving(true);
    setSavedMessage("");
    try {
      const records = rows.filter((r) => r.present !== null).map((r) => ({ studentId: r.studentId, present: r.present }));
      await attendanceApi.mark({ classId: active.classId, date, records });
      setSavedMessage("Présences enregistrées.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Chargement…</p>;

  if (assignments.length === 0) {
    return (
      <div>
        <PageHeader title="Présences" description="Aucune classe ne vous a été assignée pour le moment." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Présences" description="Registre de présence quotidien de vos classes" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {assignments.map((a, i) => (
            <button
              key={a.classId}
              onClick={() => setActiveIndex(i)}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                i === activeIndex ? "bg-primary text-white" : "border border-border bg-surface text-ink"
              }`}
            >
              {a.className}
            </button>
          ))}
        </div>
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

      {savedMessage && <p className="mt-3 rounded-md bg-emerald-soft px-3 py-2 text-sm text-emerald">{savedMessage}</p>}

      <div className="mt-4">
        <Button onClick={handleSave} disabled={saving || rows.length === 0}>
          {saving ? "Enregistrement…" : "Enregistrer les présences"}
        </Button>
      </div>
    </div>
  );
}
