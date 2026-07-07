import Image from "next/image";

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg">
      <Image src="/logo-vorelix-wordmark.png" alt="Vorelix" width={140} height={140} className="mb-3 h-auto w-28" />
      <p className="text-sm text-muted">Système de gestion scolaire</p>
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
