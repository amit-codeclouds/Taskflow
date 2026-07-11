import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from '@/lib/token';

// basePath is '/tasks' (see next.config.js) — fetch() calls don't get Next's
// basePath auto-prefix, so the proxy route must be addressed explicitly.
const apiClient = axios.create({
  baseURL: '/tasks/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach Bearer token on every request
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Track whether we are already attempting a refresh to avoid infinite loops
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processPendingQueue(err: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (err) reject(err);
    else if (token) resolve(token);
  });
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retried) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the refresh completes
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retried = true;
    isRefreshing = true;

    try {
      // Call the local proxy — it reads the httpOnly refresh token cookie
      const res = await fetch('/tasks/api/auth/refresh', { method: 'PATCH', credentials: 'include' });
      const data = await res.json();
      const newToken: string | undefined = data.result?.token;
      if (!res.ok || !newToken) throw new Error('Refresh failed');

      setAccessToken(newToken, 3600);

      processPendingQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processPendingQueue(refreshError, null);
      clearAccessToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
