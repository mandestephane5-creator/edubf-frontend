"use client";

import { LayoutDashboard, Users, School, BookOpen, ClipboardList, AlertTriangle, CalendarPlus, Bell, Settings, GraduationCap, CheckCheck, CalendarDays } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";

const navItems = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/people", label: "Personnes (Élèves & Parents)", icon: Users },
  { href: "/admin/classes", label: "Classes", icon: School },
  { href: "/admin/subjects", label: "Matières", icon: BookOpen },
  { href: "/admin/teachers", label: "Professeurs", icon: GraduationCap },
  { href: "/admin/validation", label: "Validation", icon: CheckCheck },
  { href: "/admin/grades", label: "Notes", icon: ClipboardList },
  { href: "/admin/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/admin/attendance", label: "Présences", icon: CalendarDays },
  { href: "/admin/planning", label: "Planning (Emploi du temps & Évaluations)", icon: Bell },
  { href: "/admin/risk", label: "Élèves à risque", icon: AlertTriangle },
  { href: "/admin/communication", label: "Communication (Annonces, Signalements, Notifs)", icon: Bell },
  { href: "/admin/calendar", label: "Calendrier", icon: CalendarPlus },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export default function AdminLayout({ children }) {
  return <DashboardShell navItems={navItems}>{children}</DashboardShell>;
}
