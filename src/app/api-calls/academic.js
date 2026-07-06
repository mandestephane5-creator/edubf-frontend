import { api } from "./client";

export const gradesApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/grades${qs ? `?${qs}` : ""}`);
  },
  create: (payload) => api.post("/grades", payload),
  update: (id, payload) => api.put(`/grades/${id}`, payload),
  remove: (id) => api.del(`/grades/${id}`),
  studentAverage: (studentId, term, academicYear) =>
    api.get(`/grades/student/${studentId}/average?term=${term}&academicYear=${academicYear}`),
  classRanking: (classId, term, academicYear) =>
    api.get(`/grades/class/${classId}/ranking?term=${term}&academicYear=${academicYear}`),
  auditLog: () => api.get("/grades/audit-log"),
};

export const incidentsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/incidents${qs ? `?${qs}` : ""}`);
  },
  create: (payload) => api.post("/incidents", payload),
  update: (id, payload) => api.put(`/incidents/${id}`, payload),
  remove: (id) => api.del(`/incidents/${id}`),
};

export const timetableApi = {
  getForClass: (classId) => api.get(`/timetable/class/${classId}`),
  createSlot: (payload) => api.post("/timetable", payload),
  removeSlot: (id) => api.del(`/timetable/${id}`),
};

export const evaluationsApi = {
  listForClass: (classId, term, academicYear) =>
    api.get(`/evaluations/class/${classId}?term=${term}&academicYear=${academicYear}`),
  createDevoir: (payload) => api.post("/evaluations/devoirs", payload),
  removeDevoir: (id) => api.del(`/evaluations/devoirs/${id}`),
  listCompositionDates: (term, academicYear) =>
    api.get(`/evaluations/compositions?term=${term}&academicYear=${academicYear}`),
  createCompositionDate: (payload) => api.post("/evaluations/compositions", payload),
  removeCompositionDate: (id) => api.del(`/evaluations/compositions/${id}`),
};
