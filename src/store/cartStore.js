import { defineStore } from "pinia";
import { useUserStore } from "@/store/userStore";
import { usePromoStore } from "@/store/promotionStore";

export const useCartStore = defineStore("cartStore", {
  state: () => ({
    items: JSON.parse(localStorage.getItem("cart")) || [],
    loyaltyDiscount: JSON.parse(localStorage.getItem("loyaltyDiscount")) || 0,
    actionDiscount: JSON.parse(localStorage.getItem("actionDiscount")) || 0,
    appliedPromoDiscount: JSON.parse(localStorage.getItem("appliedPromoDiscount")) || 0,
    promotion: JSON.parse(localStorage.getItem("promotion")) || null,
  }),

  getters: {
    totalPrice(state) {
      return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },

    finalTotalPrice(state) {
      const outletItemsTotal = state.items
        .filter(item => item.description?.toLowerCase().includes("outlet"))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);

      const nonOutletItems = state.items.filter(item => !item.description?.toLowerCase().includes("outlet"));
      let discountedPrice = nonOutletItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      if (state.loyaltyDiscount > 0) {
        discountedPrice -= (discountedPrice * state.loyaltyDiscount) / 100;
      }

      if (state.actionDiscount > 0) {
        discountedPrice -= (discountedPrice * state.actionDiscount) / 100;
      }

      if (state.appliedPromoDiscount > 0) {
        discountedPrice -= state.appliedPromoDiscount;
      }

      return Math.max(0, Math.round(discountedPrice + outletItemsTotal));
    },

    getItemById: (state) => (productId) => {
      return state.items.find(item => item.product_id === productId);
    }
  },

  actions: {
    applyLoyaltyDiscount() {
      const userStore = useUserStore();
      const discounts = {
        bronze: 3,
        silver: 5,
        gold: 7,
        platinum: 10,
      };

      if (!userStore.profile || !userStore.profile.loyalty_status) return;

      if (userStore.profile.loyalty_status in discounts) {
        this.loyaltyDiscount = discounts[userStore.profile.loyalty_status];
        localStorage.setItem("loyaltyDiscount", JSON.stringify(this.loyaltyDiscount));
      } else {
        this.loyaltyDiscount = 0;
        localStorage.removeItem("loyaltyDiscount");
      }
      this.saveCart();
    },

    applyDiscount(percent) {
      this.actionDiscount = percent;
      localStorage.setItem("actionDiscount", JSON.stringify(this.actionDiscount));
    },

    applyPromoDiscount(promotion) {
      this.promotion = promotion;
      localStorage.setItem("promotion", JSON.stringify(promotion));

      if (promotion.target_product_id || promotion.promo_type === "code") {
        this.actionDiscount = 0;
        localStorage.removeItem("actionDiscount");
      }
      this.recalculateDiscount();
    },

    recalculateDiscount() {
      if (!this.promotion) {
        this.appliedPromoDiscount = 0;
        return;
      }
      const { discount, promo_type, target_product_id } = this.promotion;

      const nonOutletItems = this.items.filter(item => !item.description?.toLowerCase().includes("outlet"));
      const basePrice = nonOutletItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      if (promo_type === "code") {
        this.appliedPromoDiscount = Math.round((basePrice * parseFloat(discount)) / 100);
      } else if (promo_type === "discount") {
        if (target_product_id) {
          const item = this.items.find((i) => i.product_id === target_product_id);
          if (item) {
            const discountAmount = (item.price * item.quantity * parseFloat(discount)) / 100;
            this.appliedPromoDiscount = Math.round(discountAmount);
          } else {
            this.appliedPromoDiscount = 0;
          }
        } else {
          this.appliedPromoDiscount = Math.round((basePrice * parseFloat(discount)) / 100);
        }
      } else {
        this.appliedPromoDiscount = 0;
      }
      localStorage.setItem("appliedPromoDiscount", JSON.stringify(this.appliedPromoDiscount));
    },

    clearDiscounts() {
      this.actionDiscount = 0;
      this.appliedPromoDiscount = 0;
      this.promotion = null;
      localStorage.removeItem("actionDiscount");
      localStorage.removeItem("appliedPromoDiscount");
      localStorage.removeItem("promotion");
    },

    applyGift21(mainProductId, giftProduct) {
      const promoStore = usePromoStore();

      if (!promoStore.isGiftPromotionActive()) return;

      const product = this.items.find(item => item.product_id === mainProductId);
      const gift = this.items.find(item => item.product_id === giftProduct.product_id);
      const expectedQty = product ? Math.floor(product.quantity / 2) : 0;

      if (expectedQty === 0) {
        this.items = this.items.filter(item => item.product_id !== giftProduct.product_id);
      } else {
        if (gift) {
          gift.quantity = expectedQty;
        } else {
          this.items.push({
            product_id: giftProduct.product_id,
            title: giftProduct.title,
            price: giftProduct.price,
            isGift: true,
            quantity: expectedQty,
            images: giftProduct.images || []
          });
        }
      }

      this.saveCart();
    },

    addToCart(product) {
      const existing = this.items.find((item) => item.product_id === product.product_id);
      if (existing) {
        existing.quantity += 1;
      } else {
        this.items.push({ ...product, quantity: 1 });
      }
      this.saveCart();
      this.recalculateDiscount();
    },

    removeFromCart(productId) {
      this.items = this.items.filter((item) => item.product_id !== productId);
      this.saveCart();
      this.recalculateDiscount();
    },

    updateQuantity(productId, quantity) {
      const item = this.items.find((item) => item.product_id === productId);
      if (item) item.quantity = quantity;
      this.saveCart();
      this.recalculateDiscount();
    },

    saveCart() {
      localStorage.setItem("cart", JSON.stringify(this.items));
    },

    loadDiscounts() {
      this.loyaltyDiscount = JSON.parse(localStorage.getItem("loyaltyDiscount")) || 0;
      this.actionDiscount = JSON.parse(localStorage.getItem("actionDiscount")) || 0;
      this.appliedPromoDiscount = JSON.parse(localStorage.getItem("appliedPromoDiscount")) || 0;
      this.promotion = JSON.parse(localStorage.getItem("promotion")) || null;
    },

    clearCart() {
      this.items = [];
      localStorage.removeItem("cart");
    },
    
  },
});