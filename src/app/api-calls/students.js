import { api } from "./client";

export const studentsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/students${qs ? `?${qs}` : ""}`);
  },
  getById: (id) => api.get(`/students/${id}`),
  checkParentPhone: (phone) => api.get(`/students/check-parent-phone?phone=${encodeURIComponent(phone)}`),
  create: (payload) => api.post("/students", payload),
  bulkCreate: (rows) => api.post("/students/bulk", { rows }),
  update: (id, payload) => api.put(`/students/${id}`, payload),
  remove: (id) => api.del(`/students/${id}`),
  grades: (id, academicYear) => api.get(`/students/${id}/grades${academicYear ? `?academicYear=${academicYear}` : ""}`),
  incidents: (id, month) => api.get(`/students/${id}/incidents${month ? `?month=${month}` : ""}`),
};
