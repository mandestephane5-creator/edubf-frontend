"use client";

import { LayoutDashboard, Users, UserRound, School, BookOpen, ClipboardList, AlertTriangle, Calendar, CalendarClock, Bell, Settings } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";

const navItems = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/students", label: "Élèves", icon: Users },
  { href: "/admin/parents", label: "Parents", icon: UserRound },
  { href: "/admin/classes", label: "Classes", icon: School },
  { href: "/admin/subjects", label: "Matières", icon: BookOpen },
  { href: "/admin/grades", label: "Notes", icon: ClipboardList },
  { href: "/admin/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/admin/timetable", label: "Emploi du temps", icon: Calendar },
  { href: "/admin/evaluations", label: "Évaluations", icon: CalendarClock },
  { href: "/admin/risk", label: "Élèves à risque", icon: AlertTriangle },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export default function AdminLayout({ children }) {
  return <DashboardShell navItems={navItems}>{children}</DashboardShell>;
}
