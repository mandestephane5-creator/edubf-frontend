"use client";

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="focus-ring rounded-md px-2 py-1 text-muted hover:bg-bg"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
