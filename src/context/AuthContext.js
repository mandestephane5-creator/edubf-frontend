"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/app/api-calls/auth";
import { clearTokens } from "@/app/api-calls/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && localStorage.getItem("edubf_access_token");
    if (hasToken) loadUser();
    else setLoading(false);
  }, [loadUser]);

  async function login(schoolSlug, identifier, password) {
    const data = await authApi.login(schoolSlug, identifier, password);
    authApi.saveSession(data);
    await loadUser();
    router.push("/admin");
  }

  async function logout() {
    await authApi.logout();
    clearTokens();
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  return ctx;
}
