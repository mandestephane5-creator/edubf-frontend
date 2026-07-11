"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui";
import { teachersApi } from "@/app/api-calls/staff";
import { timetableApi } from "@/app/api-calls/academic";

const DAYS = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];

export default function TeacherTimetablePage() {
  const [assignments, setAssignments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teachersApi.myAssignments().then(async (list) => {
      setAssignments(list);
      const classIdToName = new Map(list.map((a) => [a.classId, a.className]));
      const uniqueClassIds = [...new Set(list.map((a) => a.classId))];
      const results = await Promise.all(uniqueClassIds.map((id) => timetableApi.getForClass(id)));
      // On ne garde que les créneaux qui correspondent à une matière que ce professeur enseigne
      const mySubjectIds = new Set(list.map((a) => a.subjectId));
      const allSlots = results
        .flat()
        .filter((s) => mySubjectIds.has(s.subjectId))
        .map((s) => ({ ...s, className: classIdToName.get(s.classId) }));
      setSlots(allSlots);
      setLoading(false);
    });
  }, []);

  const hours = [...new Set(slots.map((s) => s.startHour))].sort((a, b) => a - b);

  function slotFor(day, hour) {
    return slots.find((s) => s.day === day && s.startHour === hour);
  }

  if (loading) return <p className="text-sm text-muted">Chargement…</p>;

  return (
    <div>
      <PageHeader title="Mon emploi du temps" description="Vos créneaux, toutes classes confondues" />

      {hours.length === 0 ? (
        <p className="text-sm text-muted">Aucun créneau ne vous est encore assigné.</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="px-3 py-2 text-left">Heure</th>
                {DAYS.map((d) => (
                  <th key={d} className="px-3 py-2 text-left">
                    {d.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((hour) => (
                <tr key={hour} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-medium text-ink">{hour}h</td>
                  {DAYS.map((day) => {
                    const slot = slotFor(day, hour);
                    return (
                      <td key={day} className={`px-3 py-2 ${slot ? "bg-primary-soft text-primary" : "text-muted"}`}>
                        {slot ? `${slot.className} · ${slot.subject.name}` : ""}
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
