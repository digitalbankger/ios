import { defineStore } from "pinia";
import { fetchUser, updateUser } from "@/services/userService";
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from "@/store/authStore";

export const useUserStore = defineStore("userStore", {
  state: () => ({
    profile: null,
  }),

  actions: {
    async loadProfile() {
      const authStore = useAuthStore();
      if (!authStore.user?.id) {
        console.warn("[loadProfile] Нет `user.id`, профиль не загружен.");
        return;
      }

      try {
        const data = await fetchUser(authStore.user.id);

        if (data) {
          this.profile = {
            id: authStore.user.id,
            ...data,
            addresses: data.addresses || [],
            cards: data.cards || [],
            bonuses: {
              valid: { value: data.bonuses?.valid?.value || 0 },
              expiring: {
                value: data.bonuses?.expiring?.value || 0,
                date_end: data.bonuses?.expiring?.date_end || null,
              },
              expired: { value: data.bonuses?.expired?.value || 0 },
            },
          };

          useCartStore().applyLoyaltyDiscount();
        }
      } catch (error) {
        console.error("[loadProfile] Ошибка загрузки профиля:", error);
      }
    },

    async saveProfile(updatedData) {
      if (!this.profile?.id) {
        console.warn("[saveProfile] Нет ID пользователя, обновление невозможно.");
        return;
      }

      try {
        const data = await updateUser(this.profile.id, updatedData);
        if (data) {
          this.profile = {
            ...this.profile,
            ...data,
            addresses: data.addresses || [],
            cards: data.cards || [],
            bonuses: {
              valid: { value: data.bonuses?.valid?.value ?? this.profile.bonuses.valid.value },
              expiring: {
                value: data.bonuses?.expiring?.value ?? this.profile.bonuses.expiring.value,
                date_end: data.bonuses?.expiring?.date_end ?? this.profile.bonuses.expiring.date_end,
              },
              expired: { value: data.bonuses?.expired?.value ?? this.profile.bonuses.expired.value },
            },
          };

          useCartStore().applyLoyaltyDiscount();
        }
      } catch (error) {
        console.error("[saveProfile] Ошибка обновления профиля:", error);
      }
    },

    async addAddress(newAddress) {
      if (!this.profile?.id) return;

      try {
        const updatedAddresses = [...this.profile.addresses, newAddress];
        const response = await updateUser(this.profile.id, { addresses: updatedAddresses });

        if (response) {
          this.profile.addresses = updatedAddresses;
        }
      } catch (error) {
        console.error("[addAddress] Ошибка добавления адреса:", error);
      }
    },

    async removeAddress(index) {
      if (!this.profile?.id) return;

      try {
        const updatedAddresses = this.profile.addresses.filter((_, i) => i !== index);
        const response = await updateUser(this.profile.id, { addresses: updatedAddresses });

        if (response) {
          this.profile.addresses = updatedAddresses;
        }
      } catch (error) {
        console.error("[removeAddress] Ошибка удаления адреса:", error);
      }
    },
  },

  persist: {
    key: "userStore",
    storage: localStorage,
  },
});
