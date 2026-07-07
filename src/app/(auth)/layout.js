import Image from "next/image";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-surface p-2">
            <Image src="/logo-orivex-emblem.png" alt="Orivex" width={40} height={40} className="h-full w-full object-contain" />
          </div>
          <p className="text-2xl font-semibold tracking-tight text-ink">Orivex</p>
          <p className="mt-1 text-sm text-muted">Système de gestion scolaire</p>
        </div>
        {children}
      </div>
    </div>
  );
}
