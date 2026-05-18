import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const fileService = {
  listFiles: () => api.get('/files/list'),
  uploadFile: (formData, config = {}) => api.post('/files/upload', formData, config),
  downloadFile: (id) => api.get(`/files/download/${id}`), // Changed to default as we reassemble hex
  deleteFile: (id) => api.delete(`/files/${id}`),
  listBinFiles: () => api.get('/files/bin'),
  restoreFile: (id) => api.post(`/files/${id}/restore`),
  purgeFile: (id) => api.delete(`/files/${id}/purge`),
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
