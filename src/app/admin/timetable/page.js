"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui";
import { classesApi, subjectsApi } from "@/app/api-calls/directory";
import { timetableApi } from "@/app/api-calls/academic";

const DAYS = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 7); // 7h à 16h

export default function TimetablePage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classId, setClassId] = useState("");
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      const [c, s] = await Promise.all([classesApi.list(), subjectsApi.list()]);
      setClasses(c);
      setSubjects(s);
    }
    init();
  }, []);

  async function loadSlots() {
    if (!classId) return;
    try {
      setSlots(await timetableApi.getForClass(classId));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  function slotFor(day, hour) {
    return slots.find((s) => s.day === day && s.startHour === hour);
  }

  async function handleCellClick(day, hour) {
    const existing = slotFor(day, hour);
    const subjectNames = subjects.map((s) => s.name).join(", ");
    const input = window.prompt(
      `Matière pour ${day} ${hour}h00-${hour + 1}h00 (laisser vide pour effacer)\nDisponibles: ${subjectNames}`,
      existing?.subject?.name ?? ""
    );
    if (input === null) return;

    try {
      if (input.trim() === "") {
        if (existing) await timetableApi.removeSlot(existing.id);
      } else {
        const subject = subjects.find((s) => s.name.toLowerCase() === input.trim().toLowerCase());
        if (!subject) {
          setError(`Matière "${input}" introuvable`);
          return;
        }
        await timetableApi.createSlot({ classId, day, startHour: hour, endHour: hour + 1, subjectId: subject.id });
      }
      loadSlots();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader title="Emploi du temps" description="Grille hebdomadaire récurrente, par classe" />

      <div className="mb-6">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink">Classe</span>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="focus-ring rounded-md border border-border bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">Choisir une classe</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      </div>

      {error && <p className="mb-4 rounded-lg bg-rose-soft px-3 py-2 text-sm text-rose">{error}</p>}

      {!classId ? (
        <p className="text-sm text-muted">Sélectionnez une classe pour afficher son emploi du temps.</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 font-medium text-muted">Heures</th>
                {DAYS.map((d) => (
                  <th key={d} className="px-3 py-2 font-medium text-muted">{d.charAt(0) + d.slice(1).toLowerCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-mono text-muted">{hour}h00</td>
                  {DAYS.map((day) => {
                    const slot = slotFor(day, hour);
                    return (
                      <td
                        key={day}
                        onClick={() => handleCellClick(day, hour)}
                        className={`cursor-pointer px-3 py-2 transition hover:bg-primary-soft ${
                          slot ? "bg-primary-soft font-medium text-primary" : "text-muted"
                        }`}
                      >
                        {slot ? slot.subject.name : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
