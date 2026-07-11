import { api, downloadFile } from "./client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const teachersApi = {
  list: () => api.get("/teachers"),
  create: (payload) => api.post("/teachers", payload),
  updateAssignments: (id, assignments) => api.put(`/teachers/${id}/assignments`, { assignments }),
  setActive: (id, isActive) => api.put(`/teachers/${id}/active`, { isActive }),
  myAssignments: () => api.get("/teachers/me/assignments"),
};

export const validationApi = {
  listPendingByClass: () => api.get("/validation/pending"),
  getPendingDetail: (classId) => api.get(`/validation/pending/${classId}`),
  validateClass: (classId) => api.post("/validation/validate", { classId }),
};

export const disruptiveApi = {
  countsForClass: (classId) => api.get(`/disruptive-reports/class/${classId}`),
  report: (studentId) => api.post("/disruptive-reports", { studentId }),
};

export const attendanceApi = {
  getForClassAndDate: (classId, date) => api.get(`/attendance/class/${classId}?date=${date}`),
  mark: (payload) => api.post("/attendance", payload),
  getForStudent: (studentId) => api.get(`/attendance/student/${studentId}`),
};

export const calendarApi = {
  list: () => api.get("/calendar-events"),
  create: (payload) => api.post("/calendar-events", payload),
  update: (id, payload) => api.put(`/calendar-events/${id}`, payload),
  remove: (id) => api.del(`/calendar-events/${id}`),
};

export const credentialsExportApi = {
  downloadClassPdf: (classId, className) =>
    downloadFile(`${API_URL}/credentials-export/class/${classId}/pdf`, `identifiants-${className}.pdf`),
};
