import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const fileService = {
  listFiles: (folderId, allFiles = false) => {
    let url = '/files/list';
    const params = new URLSearchParams();
    if (folderId) params.append('folder_id', folderId);
    if (allFiles) params.append('all_files', 'true');
    if (params.toString()) url += `?${params.toString()}`;
    return api.get(url);
  },
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
  },
  copyFile: (id, folderId) => api.post(`/files/${id}/copy${folderId ? `?folder_id=${folderId}` : ''}`),
  moveFile: (id, folderId) => api.post(`/files/${id}/move${folderId ? `?folder_id=${folderId}` : ''}`),
};

export const folderService = {
  listFolders: (parentId) => api.get(`/api/folders${parentId ? `?parent_id=${parentId}` : ''}`),
  createFolder: (folderData) => api.post('/api/folders', folderData),
  updateFolder: (id, folderData) => api.put(`/api/folders/${id}`, folderData),
  deleteFolder: (id) => api.delete(`/api/folders/${id}`),
  getFolderStats: (id) => api.get(`/api/folders/${id}/stats`),
};

export const adminService = {
  getNodes: () => api.get('/admin/node-health'),
  getNodeHealth: (id) => api.get(`/admin/node-health/${id}`),
  toggleNode: (id, status) => api.post(`/admin/nodes/${id}/toggle?status=${status}`),
  getSystemMetrics: () => api.get('/admin/system-metrics'),
  getNetworkIp: () => api.get('/admin/network-ip'),
};

export const dashboardService = {
  getStats: () => api.get('/api/dashboard/stats'),
};
