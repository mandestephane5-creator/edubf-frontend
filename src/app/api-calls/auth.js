import { api, setTokens, clearTokens } from "./client";

export const authApi = {
  // Sur le web, seul le staff (admin/surveillant) se connecte, donc "identifier" = email
  login: (schoolSlug, identifier, password) => api.post("/auth/login", { schoolSlug, identifier, password }),
  registerSchool: (payload) => api.post("/auth/register-school", payload),
  me: () => api.get("/auth/me"),
  forgotPassword: (schoolSlug, email) => api.post("/auth/forgot-password", { schoolSlug, email }),
  resetPassword: (token, newPassword) => api.post("/auth/reset-password", { token, newPassword }),
  changePassword: (currentPassword, newPassword) => api.put("/auth/change-password", { currentPassword, newPassword }),
  logout: async () => {
    try {
      await api.post("/auth/logout", {});
    } finally {
      clearTokens();
    }
  },
  saveSession: (data) => setTokens(data),
};
