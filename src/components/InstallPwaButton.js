"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

/**
 * Capture l'événement natif du navigateur proposant d'installer l'app (PWA), et
 * affiche un bouton dédié pour le déclencher — sans ça, l'utilisateur devrait deviner
 * l'icône discrète que certains navigateurs affichent dans la barre d'adresse.
 */
export default function InstallPwaButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function handleBeforeInstall(e) {
      e.preventDefault();
      setInstallPrompt(e);
    }
    function handleInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (!installPrompt || installed) return null;

  async function handleInstall() {
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  return (
    <button
      onClick={handleInstall}
      className="focus-ring flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-bg"
      title="Installer Vorelix sur cet appareil"
    >
      <Download size={14} />
      Installer l'app
    </button>
  );
}
