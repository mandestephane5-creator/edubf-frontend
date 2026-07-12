"use client";

import { LayoutDashboard, ClipboardList, AlertTriangle, Flag, Calendar, User, BarChart3 } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";

const navItems = [
  { href: "/teacher", label: "Mes classes", icon: LayoutDashboard },
  { href: "/teacher/grades", label: "Notes", icon: ClipboardList },
  { href: "/teacher/statistics", label: "Statistiques", icon: BarChart3 },
  { href: "/teacher/incidents", label: "Incidents (absences, retards, expulsions)", shortLabel: "Incidents", icon: AlertTriangle },
  { href: "/teacher/disruptive", label: "Élèves perturbateurs", shortLabel: "Perturbateurs", icon: Flag },
  { href: "/teacher/timetable", label: "Mon emploi du temps", shortLabel: "Emploi du temps", icon: Calendar },
  { href: "/teacher/profile", label: "Profil", icon: User },
];

export default function TeacherLayout({ children }) {
  return <DashboardShell navItems={navItems}>{children}</DashboardShell>;
}
