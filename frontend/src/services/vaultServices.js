import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const fileService = {
  listFiles: () => api.get('/files/list'),
  uploadFile: (formData) => api.post('/files/upload', formData),
  downloadFile: (id) => api.get(`/files/download/${id}`, { responseType: 'blob' }),
  deleteFile: (id) => api.delete(`/files/${id}`),
};

export const nodeService = {
  getNodes: () => api.get('/admin/node-health'),
  getNodeHealth: (id) => api.get(`/admin/node-health/${id}`),
  toggleNode: (id, status) => api.post(`/admin/nodes/${id}/toggle?status=${status}`),
};
