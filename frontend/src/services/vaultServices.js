import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const fileService = {
  listFiles: () => api.get('/files/list'),
  uploadFile: (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  downloadFile: (id) => api.get(`/files/download/${id}`, { responseType: 'blob' }),
  deleteFile: (id) => api.delete(`/files/${id}`),
};

export const nodeService = {
  getNodes: () => api.get('/health/nodes'),
  getNodeHealth: (id) => api.get(`/admin/node-health/${id}`),
};
