import { vi } from 'vitest';

// Створюємо глобальний об'єкт import.meta.env до завантаження скриптів
global.import = { meta: { env: { VITE_APP_STATUS: 'testing' } } };