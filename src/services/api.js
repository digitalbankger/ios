import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { refreshAuthToken } from "@/services/authService";

const api = axios.create({
  baseURL: "https://api.daigo.ru",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();

    if (error.response?.status === 401 && authStore.refreshToken) {
      console.warn("Токен устарел, пробуем обновить...");

      const data = await refreshAuthToken(authStore.refreshToken);
      if (data.token && data.refresh_token) {
        authStore.setAuthData(data);
        error.config.headers.Authorization = `Bearer ${data.token}`;
        return api(error.config);
      } else {
        authStore.logout();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
