import { defineStore } from "pinia";
import { fetchUser, updateUser, addUserAddress } from "@/services/userService";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

export const useUserStore = defineStore("userStore", {
  state: () => ({
    profile: null,
    isLoading: false,
    error: "",
  }),

  actions: {
    async loadProfile() {
      const authStore = useAuthStore();
      const userId = authStore.userId || authStore.user?.id || localStorage.getItem("daigo_id");

      if (!userId || !authStore.token) {
        this.profile = null;
        return null;
      }

      this.isLoading = true;
      this.error = "";
      try {
        const data = await fetchUser(userId);
        this.profile = {
          id: userId,
          ...data,
          addresses: data?.addresses || [],
          cards: data?.cards || [],
          bonuses: {
            valid: { value: data?.bonuses?.valid?.value || 0 },
            expiring: {
              value: data?.bonuses?.expiring?.value || 0,
              date_end: data?.bonuses?.expiring?.date_end || null,
            },
            expired: { value: data?.bonuses?.expired?.value || 0 },
          },
        };
        useCartStore().applyLoyaltyDiscount();
        return this.profile;
      } catch (error) {
        this.error = error?.response?.data?.message || error?.message || "Ошибка загрузки профиля";
        console.error("[loadProfile] Ошибка загрузки профиля:", error);
        if ([401, 403].includes(error?.response?.status)) authStore.logout();
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async saveProfile(updatedData) {
      const authStore = useAuthStore();
      const userId = this.profile?.id || authStore.userId;
      if (!userId) return null;

      const data = await updateUser(userId, updatedData);
      this.profile = {
        ...(this.profile || {}),
        ...data,
        id: userId,
        addresses: data?.addresses || this.profile?.addresses || [],
        cards: data?.cards || this.profile?.cards || [],
        bonuses: data?.bonuses || this.profile?.bonuses || {
          valid: { value: 0 },
          expiring: { value: 0, date_end: null },
          expired: { value: 0 },
        },
      };
      useCartStore().applyLoyaltyDiscount();
      return this.profile;
    },

    async addAddress(newAddress) {
      const authStore = useAuthStore();
      const userId = this.profile?.id || authStore.userId;
      if (!userId) return null;
      await addUserAddress(userId, newAddress);
      return this.loadProfile();
    },

    async removeAddress(index) {
      const addresses = (this.profile?.addresses || []).filter((_, itemIndex) => itemIndex !== index);
      return this.saveProfile({ addresses });
    },

    clear() {
      this.profile = null;
      this.error = "";
    },
  },
});
