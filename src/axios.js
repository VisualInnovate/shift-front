import axios from 'axios';
import router from '@/router';
import { useAuthStore } from './stores/WebAuth';

axios.defaults.baseURL = import.meta.env.VITE_URI || 'http://localhost:8000';
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['local'] = localStorage.getItem('appLang') || 'en';

// Simple in-memory cache: url → { data, expiresAt }
const cache = new Map();
const CACHE_TTL = 30_000; // 30 seconds

// Request interceptor
axios.interceptors.request.use((config) => {
  try {
    const currentRoute = router.currentRoute.value;
    let token = null;
    if (currentRoute.path.startsWith('/admin')) {
      token = localStorage.getItem('token');
    } else {
      token = localStorage.getItem('webToken');
    }

    if (token) {
      try {
        const parsedToken = JSON.parse(token);
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${parsedToken}`;
      } catch {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    config.headers = config.headers || {};
    config.headers.Accept = 'application/json';
    config.headers['Content-Type'] = 'application/json';
  } catch {
    // silent
  }

  return config;
});

// Response interceptor
axios.interceptors.response.use(
  (response) => {
    // Cache only GET requests that succeeded
    if (response.config.method === 'get' && response.config.url) {
      const key = response.config.baseURL + response.config.url;
      cache.set(key, { data: response.data, expiresAt: Date.now() + CACHE_TTL });
    }
    return response;
  },
  (error) => {
    const authStore = useAuthStore();
    if (error.response?.status === 401) {
      const currentRoute = router.currentRoute.value;
      if (currentRoute.path.startsWith('/admin')) {
        localStorage.removeItem('adminToken');
        router.push({ name: 'login' });
      } else {
        authStore.clearAllData();
        router.push({ name: 'home' });
      }
    } else if (error.response?.status === 403) {
      const currentRoute = router.currentRoute.value;
      if (currentRoute.path.startsWith('/admin')) {
        router.push({ name: 'no-permission' });
      } else {
        router.push({ name: 'home' });
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Cached GET — returns cached response within TTL, otherwise fetches fresh.
 * Usage: cachedGet('/api/home/get-categories/')
 */
export function cachedGet(url, config = {}) {
  const key = (axios.defaults.baseURL || '') + url;
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return Promise.resolve({ data: cached.data });
  }
  return axios.get(url, config);
}

export default axios;
