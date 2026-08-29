import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations } from '../utils/translations';

export const useLanguageStore = create(
  persist(
    (set, get) => ({
      currentLanguage: 'EN',
      setLanguage: (lang) => set({ currentLanguage: lang }),
      t: (namespace, key) => {
        const lang = get().currentLanguage;
        const dict = translations[lang] || translations['EN'];
        return dict[namespace]?.[key] || translations['EN'][namespace]?.[key] || key;
      }
    }),
    {
      name: 'zancrypt-language',
    }
  )
);
