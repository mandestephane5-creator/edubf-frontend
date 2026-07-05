import { api } from "./client";

export const notificationsApi = {
  list: (unreadOnly) => api.get(`/notifications${unreadOnly ? "?unreadOnly=true" : ""}`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
};

export const searchApi = {
  searchStudents: (q) => api.get(`/search/students?q=${encodeURIComponent(q)}`),
};

export const riskApi = {
  list: (term, academicYear) => api.get(`/risk/students?term=${term}&academicYear=${academicYear}`),
};

export const announcementsApi = {
  list: () => api.get("/announcements"),
  create: (payload) => api.post("/announcements", payload),
  remove: (id) => api.del(`/announcements/${id}`),
};

export const reportsApi = {
  list: () => api.get("/reports"),
  markResolved: (id) => api.put(`/reports/${id}/resolve`),
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api");

export const exportUrls = {
  classStudents: (classId) => `${API_BASE}/export/classes/${classId}/students`,
  classGrades: (classId, term, academicYear) =>
    `${API_BASE}/export/classes/${classId}/grades?term=${term}&academicYear=${academicYear}`,
};
