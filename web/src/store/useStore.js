import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Token is kept in MEMORY ONLY — never written to localStorage.
// On page refresh, silentRefresh() restores it via the httpOnly cookie.

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null, // Add token directly to state
      isAuthenticated: false,
      isInitializing: true,
      keyMaterial: null,

      setKeyMaterial: (salt) => set({ keyMaterial: salt }),
      clearKeyMaterial: () => set({ keyMaterial: null }),

      setAuth: (user, token) => {
        sessionStorage.removeItem('zancrypt-logged-out');
        set({ user, token: token ?? null, isAuthenticated: true, isInitializing: false });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isInitializing: false, keyMaterial: null });
        localStorage.removeItem('zancrypt-auth-state');
        // Mark intentional logout so silentRefresh on the next page load
        // does not re-authenticate the user via a surviving httpOnly cookie.
        sessionStorage.setItem('zancrypt-logged-out', '1');
      },

      restoreToken: (token, user = null) => {
        set((state) => ({
          token: token ?? null,
          isAuthenticated: true,
          isInitializing: false,
          user: user ?? state.user,
        }));
      },

      setInitialized: () => set({ isInitializing: false }),
    }),
    {
      name: 'zancrypt-auth-state',
      storage: createJSONStorage(() => localStorage),
      // Persist user + isAuthenticated so UI doesn't flash-redirect on reload
      // before silentRefresh has had a chance to restore the access token.
      // isInitializing, token and keyMaterial are intentionally excluded.
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);