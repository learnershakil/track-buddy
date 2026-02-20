import axios from "axios";
import { CONFIG } from "@/constants/config";
import { useAuthStore } from "@/store/auth.store";

export const apiClient = axios.create({
  baseURL:        CONFIG.API_BASE_URL,
  timeout:        10_000,
  headers: { "Content-Type": "application/json" },
});

// Attach token on every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) useAuthStore.getState().logout();
    return Promise.reject(err);
  }
);
