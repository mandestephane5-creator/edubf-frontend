"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Bell, LogOut, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { notificationsApi } from "@/app/api-calls/misc";
import LoadingScreen from "./LoadingScreen";

export default function DashboardShell({ navItems, children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    notificationsApi
      .list(true)
      .then((list) => setUnreadCount(list.length))
      .catch(() => {});
  }, [user]);

  if (loading || !user) {
    return <LoadingScreen />;
  }

  const roleLabel = user.role === "ADMIN" ? "Directrice" : "Surveillant";

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden w-60 shrink-0 flex-col bg-primary text-white md:flex">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <Shield size={19} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">Sainte Marie</p>
            <p className="mt-1 text-[11px] text-white/60">Gestion scolaire</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active ? "bg-white text-primary" : "text-white/80 hover:bg-white/10"
                }`}
              >
                <Icon size={17} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/15 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{roleLabel}</p>
              <p className="truncate text-xs text-white/60">{user.email}</p>
            </div>
            <button onClick={logout} aria-label="Déconnexion" className="focus-ring rounded-md p-1.5 text-white/70 hover:bg-white/10">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center gap-4 border-b border-border bg-surface px-4 py-3 md:px-8">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-muted md:w-72">
            <Search size={16} />
            <span className="hidden sm:inline">Rechercher un élève…</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/admin/notifications" className="focus-ring relative rounded-full p-2 text-muted hover:bg-bg" aria-label="Notifications">
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
