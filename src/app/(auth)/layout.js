import Image from "next/image";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/logo-vorelix-wordmark.png" alt="Vorelix" width={140} height={140} className="mb-2 h-28 w-28 rounded-xl" />
          <p className="mt-1 text-sm text-muted">Système de gestion scolaire</p>
        </div>
        {children}
      </div>
    </div>
  );
}
