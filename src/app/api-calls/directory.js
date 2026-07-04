import { api } from "./client";

export const parentsApi = {
  list: (search) => api.get(`/parents${search ? `?search=${search}` : ""}`),
  getById: (id) => api.get(`/parents/${id}`),
  resetPassword: (id) => api.post(`/parents/${id}/reset-password`, {}),
};

export const classesApi = {
  list: (academicYear) => api.get(`/classes${academicYear ? `?academicYear=${academicYear}` : ""}`),
  getById: (id) => api.get(`/classes/${id}`),
  create: (payload) => api.post("/classes", payload),
  update: (id, payload) => api.put(`/classes/${id}`, payload),
  remove: (id) => api.del(`/classes/${id}`),
  assignSubject: (id, payload) => api.post(`/classes/${id}/subjects`, payload),
  removeSubject: (id, subjectId) => api.del(`/classes/${id}/subjects/${subjectId}`),
};

export const subjectsApi = {
  list: () => api.get("/subjects"),
  create: (payload) => api.post("/subjects", payload),
  update: (id, payload) => api.put(`/subjects/${id}`, payload),
  remove: (id) => api.del(`/subjects/${id}`),
};

export const schoolApi = {
  getSettings: () => api.get("/school/settings"),
  updateSettings: (payload) => api.put("/school/settings", payload),
  listSurveillants: () => api.get("/school/surveillants"),
  createSurveillant: (payload) => api.post("/school/surveillants", payload),
  deactivateSurveillant: (id) => api.del(`/school/surveillants/${id}`),
};
