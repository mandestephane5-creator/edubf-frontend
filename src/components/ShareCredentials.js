"use client";

import { useState } from "react";
import { MessageCircle, Copy, Check } from "lucide-react";

function buildMessage({ schoolName, studentName, matricule, password }) {
  return (
    `Bonjour, voici les identifiants de connexion à l'application ${schoolName} ` +
    `pour ${studentName} :\n\n` +
    `Numéro de compte : ${matricule}\n` +
    `Mot de passe : ${password}\n\n` +
    `Téléchargez l'application et connectez-vous avec ces identifiants.`
  );
}

/**
 * Boutons "Envoyer par WhatsApp" + "Copier" pour transmettre matricule/mot de passe
 * à un parent, sans service payant (WhatsApp Web/app fait le travail).
 */
export default function ShareCredentials({ schoolName, studentName, matricule, password, phone }) {
  const [copied, setCopied] = useState(false);
  if (!password) return null; // rien à partager si le parent existait déjà (pas de nouveau mot de passe)

  const message = buildMessage({ schoolName, studentName, matricule, password });

  function handleWhatsApp() {
    const cleanPhone = (phone || "").replace(/[\s+]/g, "");
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silencieux — le presse-papier peut être indisponible sur certains navigateurs
    }
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <button
        onClick={handleWhatsApp}
        className="focus-ring flex items-center gap-1.5 rounded-md bg-emerald px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
      >
        <MessageCircle size={14} /> Envoyer par WhatsApp
      </button>
      <button
        onClick={handleCopy}
        className="focus-ring flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copié !" : "Copier les identifiants"}
      </button>
    </div>
  );
}
