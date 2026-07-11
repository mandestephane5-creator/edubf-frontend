"use client";

import { LayoutDashboard } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";

const navItems = [{ href: "/teacher", label: "Mes classes", icon: LayoutDashboard }];

export default function TeacherLayout({ children }) {
  return <DashboardShell navItems={navItems}>{children}</DashboardShell>;
}
