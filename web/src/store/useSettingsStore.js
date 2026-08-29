import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      autoReplication: true,
      telemetryPolling: true,
      emailNotifications: true,
      inAppAlerts: true,
      setSetting: (key, value) => set({ [key]: value }),
    }),
    {
      name: 'zancrypt-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
