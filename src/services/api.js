import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://api.daigo.ru"
).replace(/\/+$/, "");

export const API_DEBUG = import.meta.env.VITE_API_DEBUG !== "false";

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

let refreshInFlight = null;

function requestUrl(config) {
  const base = String(config?.baseURL || API_BASE_URL).replace(/\/+$/, "");
  const path = String(config?.url || "");
  return /^https?:\/\//i.test(path) ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function getApiErrorMessage(error, fallback = "Ошибка запроса") {
  const body = error?.response?.data;
  if (typeof body === "string" && body.trim()) return body.trim();
  return (
    body?.message ||
    body?.error ||
    body?.detail ||
    body?.validation_error ||
    body?.coupon?.validation_error ||
    error?.message ||
    fallback
  );
}

api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }

  if (API_DEBUG) {
    console.log(`[API →] ${(config.method || "GET").toUpperCase()} ${requestUrl(config)}`, {
      params: config.params,
      data: config.data,
    });
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    if (API_DEBUG) {
      console.log(`[API ←] ${response.status} ${(response.config.method || "GET").toUpperCase()} ${requestUrl(response.config)}`, response.data);
    }
    return response;
  },
  async (error) => {
    const authStore = useAuthStore();
    const original = error.config;
    const status = error.response?.status;
    const url = String(original?.url || "");

    if (API_DEBUG) {
      console.error(`[API ✕] ${status || "NETWORK"} ${(original?.method || "GET").toUpperCase()} ${requestUrl(original || {})}`, {
        response: error.response?.data,
        message: error.message,
      });
    }

    const isAuthEndpoint = [
      "/v1/auth/send-code",
      "/v1/auth/send-fc",
      "/v1/auth/send-voice",
      "/v1/auth/verify-code",
      "/v1/auth/refresh",
    ].some((path) => url.includes(path));

    if (
      status === 401 &&
      authStore.refreshToken &&
      original &&
      !original.__isRetry &&
      !isAuthEndpoint
    ) {
      original.__isRetry = true;

      if (!refreshInFlight) {
        refreshInFlight = refreshClient
          .post("/v1/auth/refresh", { refresh_token: authStore.refreshToken })
          .then(({ data }) => {
            if (!data?.access_token || !data?.refresh_token) {
              throw new Error("Некорректный ответ обновления токена");
            }
            authStore.setAuthData(data);
            return true;
          })
          .catch(() => {
            authStore.logout();
            return false;
          })
          .finally(() => {
            refreshInFlight = null;
          });
      }

      const refreshed = await refreshInFlight;
      if (refreshed && authStore.token) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${authStore.token}`;
        return api(original);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
