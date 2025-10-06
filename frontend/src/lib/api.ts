// src/lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// src/main.tsx
document.title = import.meta.env.VITE_APP_NAME || 'Kanban App';
