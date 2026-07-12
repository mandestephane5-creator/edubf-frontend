"use client";

import { LayoutDashboard, Users, School, BookOpen, ClipboardList, AlertTriangle, CalendarPlus, Bell, Settings, GraduationCap, CheckCheck, BarChart3 } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";

const navItems = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/people", label: "Personnes (Élèves & Parents)", shortLabel: "Personnes", icon: Users },
  { href: "/admin/classes", label: "Classes", icon: School },
  { href: "/admin/subjects", label: "Matières", icon: BookOpen },
  { href: "/admin/teachers", label: "Professeurs", icon: GraduationCap },
  { href: "/admin/validation", label: "Validation", icon: CheckCheck },
  { href: "/admin/grades", label: "Notes", icon: ClipboardList },
  { href: "/admin/statistics", label: "Statistiques", icon: BarChart3 },
  { href: "/admin/incidents", label: "Incidents (absences, retards, expulsions)", shortLabel: "Incidents", icon: AlertTriangle },
  { href: "/admin/planning", label: "Planning (Emploi du temps & Évaluations)", shortLabel: "Planning", icon: Bell },
  { href: "/admin/risk", label: "Élèves à risque", shortLabel: "À risque", icon: AlertTriangle },
  { href: "/admin/communication", label: "Communication (Annonces, Signalements, Notifs)", shortLabel: "Communication", icon: Bell },
  { href: "/admin/calendar", label: "Calendrier", icon: CalendarPlus },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export default function AdminLayout({ children }) {
  return <DashboardShell navItems={navItems}>{children}</DashboardShell>;
}
