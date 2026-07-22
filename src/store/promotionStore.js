import { openExternalUrl } from "@/utils/openExternalUrl";
import { defineStore } from "pinia";
import api from "@/services/api";
import { fetchPromotions, getIdentityParams } from "@/services/promoService";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

export const usePromoStore = defineStore("promoStore", {
  state: () => ({
    promotions: [],
    appliedPromotion: null,
    isLoading: false,
    isApplying: false,
    pendingId: null,
    error: "",
  }),

  actions: {
    async loadPromotions() {
      if (this.isLoading) return this.promotions;
      this.isLoading = true;
      this.error = "";
      try {
        const promotions = await fetchPromotions();
        this.promotions = Array.isArray(promotions) ? promotions : [];
        this.appliedPromotion = this.promotions.find((promo) => promo.is_applied) || null;
        return this.promotions;
      } catch (error) {
        this.promotions = [];
        this.appliedPromotion = null;
        this.error = error?.response?.data?.message || error?.message || "Не удалось загрузить акции";
        console.error("[promotion] Ошибка загрузки акций:", error);
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    findPromotionByCoupon(coupon) {
      const normalized = String(coupon || "").trim().toUpperCase();
      return this.promotions.find((promo) =>
        String(promo.coupon || "").trim().toUpperCase() === normalized
      );
    },

    isGiftPromotionActive() {
      return ["gift", "2plus1"].includes(
        this.appliedPromotion?.promo_type || this.appliedPromotion?.type
      );
    },

    // Подарок больше не добавляется локально: правило 2+1 рассчитывает backend корзины.
    applyGift21Logic() {},

    async applyPromotion(promotion) {
      if (!promotion || this.isApplying) return { success: false };
      const cartStore = useCartStore();
      const authStore = useAuthStore();
      const promoType = promotion.promo_type || promotion.type || "notice";

      this.isApplying = true;
      this.pendingId = promotion.id;
      try {
        if (promotion.link) {
          const url = String(promotion.link);
          if (/^https?:\/\//i.test(url)) {
            openExternalUrl(url);
          } else {
            window.location.hash = url.startsWith("#") ? url : `#${url}`;
          }
          return { success: true };
        }

        if (["code", "2plus1"].includes(promoType) && !authStore.isAuthenticated) {
          return {
            success: false,
            authRequired: true,
            message: "Для применения акции необходимо авторизоваться",
          };
        }

        if (promoType === "code") {
          const code = String(promotion.coupon || "").trim();
          if (!code) return { success: false, message: "Для акции не задан промокод" };
          await cartStore.ensureLoaded();
          if (!cartStore.items.some((item) => !item.isGift)) {
            return { success: false, message: "Сначала добавьте товар в корзину" };
          }
          const data = await cartStore.applyCoupon(code);
          await this.loadPromotions();
          return { success: true, data };
        }

        if (promoType === "2plus1") {
          if (!promotion.product_id) {
            return { success: false, message: "Для акции не указан товар" };
          }
          const data = await cartStore.apply2plus1(promotion.product_id);
          await this.loadPromotions();
          return { success: true, data };
        }

        if (promoType === "discount" && promotion.product_slug) {
          window.location.hash = `#/product/${encodeURIComponent(promotion.product_slug)}`;
          return { success: true };
        }

        if (promoType === "notice") return { success: true };

        window.location.hash = "#/catalog";
        return { success: true };
      } catch (error) {
        const message =
          error?.response?.data?.coupon?.validation_error ||
          error?.response?.data?.validation_error ||
          error?.response?.data?.message ||
          error?.message ||
          "Акция не применена";
        return { success: false, message, error };
      } finally {
        this.isApplying = false;
        this.pendingId = null;
      }
    },

    async cancelActive(promotion = this.appliedPromotion) {
      if (!promotion?.id) return;
      const identity = getIdentityParams();
      this.isApplying = true;
      this.pendingId = promotion.id;
      try {
        await api.delete("/v1/shop/promotion/cancel", {
          params: identity,
          data: { promo_id: promotion.id },
        });
        await useCartStore().loadCart({ force: true });
        await this.loadPromotions();
      } finally {
        this.isApplying = false;
        this.pendingId = null;
      }
    },

    clearPromotion() {
      this.appliedPromotion = null;
    },
  },
});
