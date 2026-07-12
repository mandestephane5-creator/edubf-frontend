import { api, downloadFile } from "./client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const gradesApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/grades${qs ? `?${qs}` : ""}`);
  },
  create: (payload) => api.post("/grades", payload),
  createBatch: (payload) => api.post("/grades/batch", payload),
  update: (id, payload) => api.put(`/grades/${id}`, payload),
  remove: (id) => api.del(`/grades/${id}`),
  studentAverage: (studentId, term, academicYear) =>
    api.get(`/grades/student/${studentId}/average?term=${term}&academicYear=${academicYear}`),
  classRanking: (classId, term, academicYear) =>
    api.get(`/grades/class/${classId}/ranking?term=${term}&academicYear=${academicYear}`),
  auditLog: () => api.get("/grades/audit-log"),
  auditLogForGrade: (id) => api.get(`/grades/${id}/audit-log`),
  teacherStats: (classId, subjectId, term, academicYear) =>
    api.get(`/grades/stats/teacher?classId=${classId}&subjectId=${subjectId}&term=${term}&academicYear=${academicYear}`),
  schoolStats: (term, academicYear) => api.get(`/grades/stats/school?term=${term}&academicYear=${academicYear}`),
  repeaters: (classId, academicYear) => api.get(`/grades/stats/repeaters/${classId}?academicYear=${academicYear}`),
};

export const incidentsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/incidents${qs ? `?${qs}` : ""}`);
  },
  create: (payload) => api.post("/incidents", payload),
  update: (id, payload) => api.put(`/incidents/${id}`, payload),
  exportClassCsv: (classId, startDate, endDate) =>
    downloadFile(`${API_URL}/incidents/export/class/${classId}?startDate=${startDate}&endDate=${endDate}`, `incidents-${classId}.csv`),
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
