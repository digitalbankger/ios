import { defineStore } from "pinia";
import { fetchBonusHistory } from "@/services/bonusService";
import { useUserStore } from "@/store/userStore";

export const useBonusStore = defineStore("bonusStore", {
  state: () => ({
    history: [],
    isLoading: false,
  }),

  actions: {
    async loadBonusHistory() {
      const userStore = useUserStore();
      const daigoId = userStore.profile?.id;
      if (!daigoId) return;

      this.isLoading = true;
      try {
        const data = await fetchBonusHistory(daigoId);
        this.history = data;
      } catch (error) {
        console.error("Ошибка при загрузке бонусов:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
