export function getAuthHeader() {
  const token = localStorage.getItem('zancrypt-auth');
  if (!token) {
    const currentPath = window.location.pathname;
    const isPublic = 
      currentPath === '/' ||
      currentPath === '/api' ||
      currentPath === '/download' ||
      currentPath === '/login' ||
      currentPath === '/register' ||
      currentPath.startsWith('/share/');
      
    if (!isPublic) {
      window.location.href = '/login';
    }
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}
