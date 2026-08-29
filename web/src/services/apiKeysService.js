import api from './api';

export const apiKeysService = {
  listKeys: async () => {
    const response = await api.get('/api/keys');
    return response.data;
  },

  createKey: async (name, scopes = ["*"], appRestrictions = null) => {
    const response = await api.post('/api/keys', { name, scopes, app_restrictions: appRestrictions });
    return response.data;
  },

  revokeKey: async (id) => {
    await api.delete(`/api/keys/${id}`);
  },

  updateRules: async (id, rules) => {
    const response = await api.put(`/api/keys/${id}/rules`, rules);
    return response.data;
  }
};
