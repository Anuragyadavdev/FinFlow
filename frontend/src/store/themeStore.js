import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'light') root.classList.remove('dark');
  else root.classList.add('dark');
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        set({ theme: next });
      },
      init: () => applyTheme(get().theme),
    }),
    { name: 'finflow-theme' }
  )
);