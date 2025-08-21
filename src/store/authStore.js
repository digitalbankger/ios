import { defineStore } from "pinia";

import {
  sendCode,
  sendCodeBeline,
  sendEmailCode,
  verifyCode,
  refreshAuthToken,
} from "@/services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    refreshToken: localStorage.getItem("refresh_token") || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async requestCode(phoneNumber) {
      try {
        const response = await sendCode(phoneNumber);
        return response?.message === "code send successfully";
      } catch (error) {
        console.error("❌ Ошибка отправки кода:", error);
        return false;
      }
    },

    async requestCodeBeline(phoneNumber) {
      try {
        const response = await sendCodeBeline(phoneNumber);
        return response;
      } catch (error) {
        console.error("❌ Ошибка отправки кода:", error);
        return false;
      }
    },

    async requestEmailCode(email) {
      try {
        return await sendEmailCode(email);
      } catch (error) {
        console.error("❌ Ошибка отправки email-кода:", error);
        return false;
      }
    },

    async checkAuthorizationStatus(phoneNumber) {
      try {
        const response = await sendCodeBeline(phoneNumber);
        return response;
      } catch (error) {
        return null;
      }
    },    

    async verifyCode(identifier, code) {
      try {
        const data = await verifyCode(identifier, code);
        
        if (data.access_token && data.refresh_token) {
          this.setAuthData(data);
          return true;
        } else {
          console.error("❌ Ошибка авторизации: некорректный ответ сервера", data);
          return false;
        }
      } catch (error) {
        console.error("❌ Ошибка верификации кода:", error);
        return false;
      }
    },

    async refreshToken() {
      if (!this.refreshToken) {
        console.error("❌ Нет refresh-токена");
        this.logout();
        return false;
      }

      try {
        const data = await refreshAuthToken(this.refreshToken);
        if (data.access_token && data.refresh_token) {
          this.setAuthData(data);
          console.log("✅ Токен успешно обновлен");
          return true;
        } else {
          console.error("❌ Ошибка обновления токена: некорректный ответ сервера", data);
          this.logout();
          return false;
        }
      } catch (error) {
        console.error("❌ Ошибка обновления токена:", error);
        this.logout();
        return false;
      }
    },

    logout() {
      this.token = null;
      this.refreshToken = null;
      this.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    },

    setAuthData(data) {
      this.token = data.access_token;
      this.refreshToken = data.refresh_token;
      this.user = data.daigo_id ? { id: data.daigo_id } : null;
    
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(this.user));
    }  

  },
});
