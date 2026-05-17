import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ 
        user: user, 
        token, 
        isAuthenticated: !!token 
      }),
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'zancrypt-auth',
      storage: createJSONStorage(() => localStorage),
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
