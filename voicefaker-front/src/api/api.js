import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3000';

const api = axios.create({ baseURL: BASE });

// Génère un audio
export const generateAudio = (text, lang, voice) =>
  api.post('/generate', { text, lang, voice });

// URL de téléchargement direct
export const getDownloadUrl = (filename) =>
  `${BASE}/download/${filename}`;

// Liste tous les fichiers
export const listFiles = () => api.get('/files');

// Stats activité
export const statsActivity = (date, from, to) => {
  if (date) return api.get(`/stats/activity?date=${date}`);
  return api.get(`/stats/activity?from=${from}&to=${to}`);
};

// Stats langues
export const statsLanguages = () => api.get('/stats/languages');

// Stats voix
export const statsVoices = () => api.get('/stats/voices');