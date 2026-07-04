import { Shield } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
        <Shield size={28} className="text-white" />
      </div>
      <p className="text-lg font-semibold text-ink">Sainte Marie</p>
      <p className="mt-1 text-sm text-muted">Système de gestion scolaire</p>
      <div className="mt-6 h-1 w-32 overflow-hidden rounded-full bg-primary-soft">
        <div className="h-full w-1/2 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-primary" />
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
