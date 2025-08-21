import { defineStore } from "pinia";
import api from "@/services/api";

export const useSettingsStore = defineStore("settingsStore", {
  state: () => ({
    outletEnabled: false,
    loaded: false,
  }),

  actions: {
    async loadSettings() {
      try {
        const response = await api.get("/v1/app/settings");
        this.outletEnabled = response.data?.outlet === true;
        this.loaded = true;
        console.log("✅ Настройки приложения загружены:", response.data);
      } catch (error) {
        console.error("❌ Ошибка загрузки настроек приложения:", error);
      }
    },
  },
});
