import { defineStore } from "pinia";
import { fetchPromotions, checkCouponUsage } from "@/services/promoService";
import { useCartStore } from "@/store/cartStore";

export const usePromoStore = defineStore("promoStore", {
  state: () => ({
    promotions: [],
    appliedPromotion: JSON.parse(localStorage.getItem("appliedPromotion")) || null,
  }),

  actions: {
    async loadPromotions() {
      try {
        this.promotions = await fetchPromotions();
      } catch (error) {
        console.error("Ошибка загрузки акций:", error);
      }
    },

    findPromotionByCoupon(coupon) {
      const normalizedCoupon = coupon.trim().toUpperCase();
      return this.promotions.find(promo => promo.coupon.trim().toUpperCase() === normalizedCoupon);
    },

    isGiftPromotionActive() {
      return this.appliedPromotion?.promo_type === "gift" && this.appliedPromotion.id === 9;
    },

    applyGift21Logic() {
      const cartStore = useCartStore();
      const mainProductId = "71700acb-3584-490b-a5f7-62e8cb57b3c9";
      const giftProduct = {
        product_id: "ca16b1e3-f6bd-4845-9079-7c66ba9d1a26",
        title: "🎁 Подарок",
        price: 0,
        isGift: true,
        images: [
          { image_url: "/uploads/products_photo/ce7c342e-1626-411d-bdf2-2a65f971afcb.png" }
        ]
      };
    
      cartStore.applyGift21(mainProductId, giftProduct);
    },

    async applyPromotion(promotion) {
      const cartStore = useCartStore();

      if (this.appliedPromotion && this.appliedPromotion.promo_type !== promotion.promo_type) {
        alert("Уже применена другая акция. Сначала сбросьте текущую!");
        return { success: false };
      }

      if (promotion.promo_type === "code") {
        const response = await checkCouponUsage(cartStore.userId, promotion.coupon);
        if (!response || response.usage) {
          alert("Купон уже использован или недоступен!");
          return { success: false };
        }
        cartStore.applyPromoDiscount(promotion);
        this.appliedPromotion = promotion;
        localStorage.setItem("appliedPromotion", JSON.stringify(promotion));
        if (typeof ym !== 'undefined') {
          ym(101458573, 'reachGoal', 'apply_promo_code');
        }   
        return { success: true };
      }

      if (promotion.promo_type === "discount") {
        if (promotion.id === 12) {
          const targetProductId = "f7b3cd6e-577f-4de6-98e7-cbcb37bc41b2";
          const targetProduct = cartStore.items.find((item) => item.product_id === targetProductId);
          if (!targetProduct) {
            alert("❌ Данная скидка применима только к определенному товару!");
            return { success: false };
          }
          promotion.target_product_id = targetProductId;
        }
        cartStore.applyPromoDiscount(promotion);
        this.appliedPromotion = promotion;
        localStorage.setItem("appliedPromotion", JSON.stringify(promotion));
        if (typeof ym !== 'undefined') {
          console.log('[YandexMetrika] Цель: Применение промокода (apply_promo_code)');
          ym(101458573, 'reachGoal', 'apply_promo_code');
        }        
        return { success: true };
      }

      if (promotion.promo_type === "gift" && promotion.id === 9) {
        this.appliedPromotion = promotion;
        localStorage.setItem("appliedPromotion", JSON.stringify(promotion));
        this.applyGift21Logic();
        if (typeof ym !== 'undefined') {
          console.log('[YandexMetrika] Цель: Применение промокода (apply_promo_code)');
          ym(101458573, 'reachGoal', 'apply_promo_code');
        }        
        return { success: true };
      }

      return { success: false };
    },

    clearPromotion() {
      this.appliedPromotion = null;
      localStorage.removeItem("appliedPromotion");
      const cartStore = useCartStore();
      cartStore.clearDiscounts();
      console.log("🚫 [clearPromotion] Все акции сброшены.");
    },
  },
});
