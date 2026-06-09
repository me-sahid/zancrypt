import { useAuthStore } from '../store/useStore';

export function getAuthHeader() {
  const token = useAuthStore.getState().token;  // reads _memoryToken 
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}