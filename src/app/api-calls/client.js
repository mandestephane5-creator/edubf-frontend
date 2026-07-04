"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * Client HTTP minimal vers le backend EduBF.
 * Gère automatiquement le token JWT stocké côté client et le rafraîchissement.
 * Ce fichier ne contient AUCUNE logique métier — uniquement l'appel réseau.
 */

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("edubf_access_token");
}

function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("edubf_refresh_token");
}

export function setTokens({ accessToken, refreshToken }) {
  if (typeof window === "undefined") return;
  if (accessToken) localStorage.setItem("edubf_access_token", accessToken);
  if (refreshToken) localStorage.setItem("edubf_refresh_token", refreshToken);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("edubf_access_token");
  localStorage.removeItem("edubf_refresh_token");
}

async function tryRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const json = await res.json();
    if (!res.ok || !json.data?.accessToken) return false;
    setTokens(json.data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Appelle l'API EduBF. Rafraîchit automatiquement le token en cas de 401
 * (une seule tentative) puis relance la requête initiale.
 */
export async function apiFetch(path, options = {}, { retry = true } = {}) {
  const token = getAccessToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiFetch(path, options, { retry: false });
    }
    clearTokens();
    if (typeof window !== "undefined") window.location.href = "/login";
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(json.message || `Erreur API (${res.status})`);
    error.code = json.code;
    error.status = res.status;
    throw error;
  }
  return json.data;
}

export const api = {
  get: (path) => apiFetch(path, { method: "GET" }),
  post: (path, body) => apiFetch(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => apiFetch(path, { method: "PUT", body: JSON.stringify(body) }),
  del: (path) => apiFetch(path, { method: "DELETE" }),
};

/** Télécharge un fichier protégé (ex: export CSV) en incluant le token d'authentification */
export async function downloadFile(url, filename) {
  const token = getAccessToken();
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Échec du téléchargement");
  const blob = await res.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
