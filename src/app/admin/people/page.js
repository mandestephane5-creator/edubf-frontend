"use client";

import { useState } from "react";
import StudentsPage from "../students/page";
import ParentsPage from "../parents/page";

export default function PeoplePage() {
  const [tab, setTab] = useState("students");

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("students")}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            tab === "students" ? "bg-primary text-white" : "border border-border bg-surface text-ink"
          }`}
        >
          Élèves
        </button>
        <button
          onClick={() => setTab("parents")}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            tab === "parents" ? "bg-primary text-white" : "border border-border bg-surface text-ink"
          }`}
        >
          Parents
        </button>
      </div>

      {tab === "students" ? <StudentsPage /> : <ParentsPage />}
    </div>
  );
}
