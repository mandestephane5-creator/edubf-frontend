import Image from "next/image";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/logo-orivex-wordmark.png" alt="Orivex" width={260} height={90} className="mb-2 h-auto w-56" />
          <p className="mt-1 text-sm text-muted">Système de gestion scolaire</p>
        </div>
        {children}
      </div>
    </div>
  );
}
