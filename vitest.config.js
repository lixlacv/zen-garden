import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    // Цей блок каже Vitest імітувати змінні оточення Vite
    setupFiles: [],
    env: {
      VITE_APP_STATUS: 'Testing',
    },
  },
});