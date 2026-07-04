import { Shield } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Shield size={24} className="text-white" />
          </div>
          <p className="text-2xl font-semibold tracking-tight text-ink">Sainte Marie</p>
          <p className="mt-1 text-sm text-muted">Système de gestion scolaire</p>
        </div>
        {children}
      </div>
    </div>
  );
}
