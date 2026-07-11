"use client";

import { useState } from "react";
import TimetablePage from "../timetable/page";
import EvaluationsPage from "../evaluations/page";

export default function PlanningPage() {
  const [tab, setTab] = useState("timetable");

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("timetable")}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            tab === "timetable" ? "bg-primary text-white" : "border border-border bg-surface text-ink"
          }`}
        >
          Emploi du temps
        </button>
        <button
          onClick={() => setTab("evaluations")}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            tab === "evaluations" ? "bg-primary text-white" : "border border-border bg-surface text-ink"
          }`}
        >
          Évaluations
        </button>
      </div>

      {tab === "timetable" ? <TimetablePage /> : <EvaluationsPage />}
    </div>
  );
}
