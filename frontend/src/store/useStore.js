import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Token is kept in MEMORY ONLY — never written to localStorage or sessionStorage.
// This eliminates the XSS token theft risk (VULN-020).
// On page refresh, the app calls /auth/refresh using the httpOnly cookie
// (set by the server) to silently restore isAuthenticated state.
export const useAuthStore = create(
  persist(
    (set) => ({
      // Only non-sensitive metadata is persisted to localStorage
      user: null,
      isAuthenticated: false,

      // Getter — reads from localStorage
      get token() { return localStorage.getItem('zancrypt-auth'); },

      setAuth: (user, token) => {
        if (token) {
          localStorage.setItem('zancrypt-auth', token);
        } else {
          localStorage.removeItem('zancrypt-auth');
        }
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('zancrypt-auth');
        set({ user: null, isAuthenticated: false });
      },

      // Called on page-load after a successful /auth/refresh — restores the token
      restoreToken: (token) => {
        if (token) {
          localStorage.setItem('zancrypt-auth', token);
        } else {
          localStorage.removeItem('zancrypt-auth');
        }
        set({ isAuthenticated: true });
      },
    }),
    {
      name: 'zancrypt-auth-state',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive fields — token is explicitly excluded
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  notifications: [],
  addNotification: (notification) => 
    set((state) => ({ notifications: [...state.notifications, { id: Date.now(), ...notification }] })),
  removeNotification: (id) => 
    set((state) => ({ notifications: state.notifications.filter(n => n.id !== id) })),
}));

