export function getAuthHeader() {
  const token = localStorage.getItem('zancrypt-auth');
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}
