import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const fileService = {
  listFiles: () => api.get('/files/list'),
  uploadFile: (formData) => api.post('/files/upload', formData),
  downloadFile: (id) => api.get(`/files/download/${id}`), // Changed to default as we reassemble hex
  deleteFile: (id) => api.delete(`/files/${id}`),
  updateFile: (id, newName) => {
    const formData = new FormData();
    formData.append('new_filename', newName);
    return api.put(`/files/${id}`, formData);
  }
};

export const adminService = {
  getNodes: () => api.get('/admin/node-health'),
  getNodeHealth: (id) => api.get(`/admin/node-health/${id}`),
  toggleNode: (id, status) => api.post(`/admin/nodes/${id}/toggle?status=${status}`),
  getSystemMetrics: () => api.get('/admin/system-metrics'),
};
