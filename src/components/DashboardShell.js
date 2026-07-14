"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Search, MoreHorizontal, X, Moon, Sun, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { notificationsApi } from "@/app/api-calls/misc";
import { searchApi } from "@/app/api-calls/misc";
import InstallPwaButton from "./InstallPwaButton";
import LoadingScreen from "./LoadingScreen";

export default function DashboardShell({ navItems, primaryHrefs, children }) {
  const { user, loading, logout } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);

  // ---- Recherche d'élève (nom, prénom, matricule) ----
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchBoxRef = useRef(null);

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

  // Ferme le tiroir "Plus" automatiquement à chaque changement de page
  useEffect(() => {
    setMoreOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Recherche avec un léger délai pour ne pas interroger le serveur à chaque frappe
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const results = await searchApi.searchStudents(searchQuery.trim());
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Ferme le menu de résultats au clic en dehors
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading || !user) {
    return <LoadingScreen />;
  }

  const roleLabel = user.role === "ADMIN" ? "Directrice" : "Surveillant";
  // Les 4 pages les plus utilisées, accessibles directement depuis la barre du bas sur
  // mobile — passées en prop par chaque layout (admin/professeur), avec un repli sur
  // les 4 premiers éléments du menu si non précisé.
  const effectivePrimaryHrefs = primaryHrefs || navItems.slice(0, 4).map((i) => i.href);
  const primaryItems = effectivePrimaryHrefs.map((href) => navItems.find((i) => i.href === href)).filter(Boolean);
  const moreItems = navItems.filter((i) => !effectivePrimaryHrefs.includes(i.href));

  function isActive(href) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* ----- Barre latérale compacte, icônes seules (desktop uniquement) ----- */}
      <aside className="hidden w-16 shrink-0 flex-col items-center bg-primary py-4 text-white md:flex">
        <Image src="/logo-vorelix-wordmark.png" alt="Vorelix" width={36} height={36} className="mb-4 h-9 w-9 rounded-lg" />

        <nav className="flex flex-1 flex-col items-center gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-label={item.label}
                className={`focus-ring flex h-10 w-10 items-center justify-center rounded-lg transition ${
                  active ? "bg-white text-primary" : "text-white/80 hover:bg-white/10"
                }`}
              >
                <Icon size={19} strokeWidth={2} />
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-3 border-t border-white/15 pt-3">
          <div
            title={`${roleLabel} — ${user.email}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold"
          >
            {user.email?.[0]?.toUpperCase()}
          </div>
          <button onClick={logout} title="Déconnexion" aria-label="Déconnexion" className="focus-ring rounded-md p-1.5 text-white/70 hover:bg-white/10">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center gap-4 border-b border-border bg-surface px-4 py-3 md:px-8">
          <div ref={searchBoxRef} className="relative min-w-0 flex-1 md:flex-none md:w-80">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2 text-sm">
              <Search size={16} className="shrink-0 text-muted" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Rechercher un élève (nom, numéro de compte)…"
                className="w-full bg-transparent text-ink outline-none placeholder:text-muted"
              />
            </div>

            {searchOpen && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-80 overflow-y-auto rounded-lg border border-border bg-surface shadow-card">
                {searching ? (
                  <p className="px-3 py-3 text-sm text-muted">Recherche…</p>
                ) : searchResults.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-muted">Aucun élève trouvé.</p>
                ) : (
                  searchResults.map((s) => (
                    <Link
                      key={s.id}
                      href={`/admin/students?q=${encodeURIComponent(s.matricule)}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between border-b border-border px-3 py-2.5 text-sm last:border-0 hover:bg-bg"
                    >
                      <span className="flex items-center gap-2 text-ink">
                        <UserIcon size={14} className="text-muted" />
                        {s.firstName} {s.lastName}
                      </span>
                      <span className="text-xs text-muted">{s.matricule} · {s.class?.name || "—"}</span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <InstallPwaButton />
            <button
              onClick={toggleDarkMode}
              aria-label="Basculer le mode sombre"
              className="focus-ring rounded-full p-2 text-muted hover:bg-bg"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
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

        {/* Espace en bas sur mobile pour ne pas passer sous la barre de navigation */}
        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">{children}</main>
      </div>

      {/* ----- Barre de navigation du bas (mobile uniquement) — style pilule active ----- */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface px-2 py-2 shadow-[0_-2px_10px_rgba(18,24,74,0.06)] md:hidden">
        <div className="flex items-stretch gap-1">
          {primaryItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`focus-ring flex flex-1 flex-col items-center gap-0.5 rounded-pill py-2 text-[11px] font-medium transition ${
                  active ? "bg-primary text-white" : "text-muted"
                }`}
              >
                <Icon size={18} strokeWidth={2} />
                <span className="truncate px-1">{item.shortLabel || item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={`focus-ring flex flex-1 flex-col items-center gap-0.5 rounded-pill py-2 text-[11px] font-medium transition ${
              moreOpen ? "bg-primary text-white" : "text-muted"
            }`}
          >
            <MoreHorizontal size={18} strokeWidth={2} />
            <span>Plus</span>
          </button>
        </div>
      </nav>

      {/* ----- Tiroir "Plus" (mobile uniquement) ----- */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-ink/40" />
          <div
            className="relative z-10 max-h-[75vh] w-full overflow-y-auto rounded-t-2xl bg-surface p-4 pb-8 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Toutes les pages</p>
              <button onClick={() => setMoreOpen(false)} aria-label="Fermer" className="focus-ring rounded-md p-1.5 text-muted hover:bg-bg">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`focus-ring flex flex-col items-center gap-2 rounded-xl border p-3 text-center text-xs font-medium ${
                      active ? "border-primary bg-primary-soft text-primary" : "border-border text-ink"
                    }`}
                  >
                    <Icon size={20} strokeWidth={2} />
                    {item.shortLabel || item.label}
                  </Link>
                );
              })}
            </div>
            <button
              onClick={toggleDarkMode}
              className="focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium text-ink"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />} {isDark ? "Mode clair" : "Mode sombre"}
            </button>
            <button
              onClick={() => { setMoreOpen(false); logout(); }}
              className="focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium text-rose"
            >
              <LogOut size={16} /> Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
