import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Token is kept in MEMORY ONLY — never written to localStorage.
// On page refresh, silentRefresh() restores it via the httpOnly cookie.
let _memoryToken = null; // lives outside store — survives re-renders, dies on tab close

export const useAuthStore = create(
  persist(
    (set) => ({
      // Only non-sensitive metadata persisted to localStorage
      user: null,
      isAuthenticated: false,
      isInitializing: true,

      // Getter reads from memory, never localStorage
      get token() {
        return _memoryToken;  // memory only
      },

      setAuth: (user, token) => {
        _memoryToken = token ?? null;  //stored in memory
        // localStorage never touched for token
        set({ user, isAuthenticated: true, isInitializing: false });
      },

      logout: () => {
        _memoryToken = null;  //cleared from memory
        set({ user: null, isAuthenticated: false, isInitializing: false });
        localStorage.removeItem('zancrypt-auth-state');
      },

      restoreToken: (token, user = null) => {
        _memoryToken = token ?? null;
        set((state) => ({
        isAuthenticated: true,
        isInitializing: false,
    // keep existing user if no new one provided
        user: user ?? state.user,
      }));
},

      setInitialized: () => set({ isInitializing: false }),
    }),
    {
      name: 'zancrypt-auth-state',
      storage: createJSONStorage(() => localStorage),
      // Only user + isAuthenticated persisted — token and isInitializing excluded
      partialize: (state) => ({ 
        user: state.user, 
      }),
    }
  )
);