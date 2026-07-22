import { defineStore } from "pinia";
import {
  sendCode,
  sendCodeFlashCall,
  verifyCode as verifyAuthCode,
  refreshAuthToken,
} from "@/services/authService";
import { getApiErrorMessage } from "@/services/api";

function readStoredUserId() {
  const direct = localStorage.getItem("daigo_id");
  if (direct) return direct;

  try {
    const legacy = JSON.parse(localStorage.getItem("user") || "null");
    return legacy?.id != null ? String(legacy.id) : null;
  } catch {
    return null;
  }
}

function getJwtExpiration(accessToken) {
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const parsed = JSON.parse(atob(normalized));
    return parsed?.exp ? Number(parsed.exp) * 1000 : null;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore("auth", {
  state: () => {
    const userId = readStoredUserId();
    return {
      user: userId ? { id: userId } : null,
      userId,
      token: localStorage.getItem("token") || null,
      refreshToken: localStorage.getItem("refresh_token") || null,
      pendingPhone: localStorage.getItem("pending_phone") || "",
      lastSendMethod: "sms",
      lastError: "",
      isSendingCode: false,
      isVerifying: false,
    };
  },

  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.userId),
  },

  actions: {
    async requestCode(phoneNumber) {
      const cleanPhone = String(phoneNumber).replace(/\D/g, "");
      if (cleanPhone.length !== 11) {
        this.lastError = "Введите номер телефона полностью";
        return { success: false, message: this.lastError };
      }

      this.isSendingCode = true;
      this.lastError = "";
      try {
        const data = await sendCode(cleanPhone);
        this.pendingPhone = cleanPhone;
        this.lastSendMethod = "sms";
        localStorage.setItem("pending_phone", cleanPhone);
        return { success: true, data };
      } catch (error) {
        this.lastError = getApiErrorMessage(error, "Не удалось отправить код");
        return { success: false, message: this.lastError, error };
      } finally {
        this.isSendingCode = false;
      }
    },

    async resendCode(phoneNumber = this.pendingPhone) {
      const cleanPhone = String(phoneNumber || "").replace(/\D/g, "");
      if (cleanPhone.length !== 11) {
        return { success: false, message: "Номер телефона не указан" };
      }

      this.isSendingCode = true;
      this.lastError = "";
      try {
        const data = await sendCodeFlashCall(cleanPhone);
        this.pendingPhone = cleanPhone;
        this.lastSendMethod = "call";
        localStorage.setItem("pending_phone", cleanPhone);
        return { success: true, data };
      } catch (error) {
        this.lastError = getApiErrorMessage(error, "Не удалось запросить звонок");
        return { success: false, message: this.lastError, error };
      } finally {
        this.isSendingCode = false;
      }
    },

    // Совместимость со старым названием action.
    async requestCodeBeline(phoneNumber) {
      return this.resendCode(phoneNumber);
    },

    async verifyCode(phoneNumber, code) {
      const cleanPhone = String(phoneNumber || this.pendingPhone).replace(/\D/g, "");
      const cleanCode = String(code).replace(/\D/g, "");

      if (cleanPhone.length !== 11 || cleanCode.length !== 4) {
        this.lastError = "Проверьте номер телефона и код";
        return { success: false, message: this.lastError };
      }

      this.isVerifying = true;
      this.lastError = "";
      try {
        const data = await verifyAuthCode(cleanPhone, cleanCode);
        if (!data?.access_token || !data?.refresh_token || data?.daigo_id == null) {
          throw new Error("Сервер не вернул токены или daigo_id");
        }

        this.setAuthData(data);
        this.pendingPhone = "";
        localStorage.removeItem("pending_phone");
        return { success: true, data };
      } catch (error) {
        this.lastError = getApiErrorMessage(error, "Неверный код или код устарел");
        return { success: false, message: this.lastError, error };
      } finally {
        this.isVerifying = false;
      }
    },

    async tryRefresh() {
      if (!this.refreshToken) return false;
      try {
        const data = await refreshAuthToken(this.refreshToken);
        if (!data?.access_token || !data?.refresh_token) return false;
        this.setAuthData(data);
        return true;
      } catch {
        this.logout();
        return false;
      }
    },

    async refreshAccessToken() {
      return this.tryRefresh();
    },

    setAuthData(data) {
      const userId = data.daigo_id != null ? String(data.daigo_id) : this.userId;
      this.token = data.access_token;
      this.refreshToken = data.refresh_token;
      this.userId = userId;
      this.user = userId ? { id: userId } : null;

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      if (userId) {
        localStorage.setItem("daigo_id", userId);
        localStorage.setItem("user", JSON.stringify({ id: userId }));
      }

      const expiresAt = getJwtExpiration(data.access_token) || Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem("auth_expires_at", String(expiresAt));
    },

    logout() {
      this.token = null;
      this.refreshToken = null;
      this.userId = null;
      this.user = null;
      this.pendingPhone = "";
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("daigo_id");
      localStorage.removeItem("auth_expires_at");
      localStorage.removeItem("pending_phone");
      localStorage.removeItem("user");
    },
  },
});
