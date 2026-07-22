import { defineStore } from "pinia";
import { cartService } from "@/services/cartService";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { ensureGuestSessionId } from "@/services/promoService";
import { normalizeMediaUrl } from "@/utils/mediaUrl";

const CART_CACHE_KEY = "server_cart_cache_v1";

function parseJson(value, fallback) {
  try {
    return JSON.parse(value || "") ?? fallback;
  } catch {
    return fallback;
  }
}

function getPayload(raw) {
  return raw?.cart || raw?.data?.cart || raw?.data || raw || {};
}

function getImage(item) {
  const raw =
    item?.image ||
    item?.image_url ||
    item?.img ||
    item?.picture ||
    item?.photo ||
    item?.images?.[0]?.image_url ||
    item?.images?.[0]?.url ||
    "";
  return normalizeMediaUrl(raw);
}

function normalizeCartItem(item = {}, isGift = false) {
  const productId = item.product_id ?? item.id ?? item.product?.product_id ?? item.product?.id ?? "";
  const name = item.title || item.name || item.name_ru || item.product?.name_ru || item.product?.name || (isGift ? "Подарок" : "Товар");
  const price = Number(item.price ?? item.product?.price ?? 0) || 0;
  const originalPrice = Number(item.original_price ?? item.originalPrice ?? item.old_price ?? item.oldPrice ?? 0) || 0;
  const imageUrl = getImage(item);

  return {
    ...item,
    id: productId,
    product_id: productId,
    title: name,
    name,
    subtitle: item.subtitle || item.product?.subtitle || "",
    description: item.description || item.product?.description || "",
    price,
    originalPrice: originalPrice > price ? originalPrice : 0,
    quantity: Math.max(1, Number(item.quantity ?? item.qty ?? item.qty_order ?? item.qty_in_cart ?? 1) || 1),
    image: imageUrl,
    images: [{ image_url: imageUrl, alt_text: name }],
    isGift: Boolean(isGift || item.isGift || item.is_gift),
  };
}

function extractCoupon(data) {
  const payload = getPayload(data);
  const direct = payload?.coupon || payload?.coupon_info || null;
  if (direct && typeof direct === "object") return direct;
  if (Array.isArray(payload?.coupons)) {
    return payload.coupons.find((item) => item?.applied === true) || payload.coupons[0] || null;
  }
  if (payload && typeof payload === "object" && ("applied" in payload || "validation_error" in payload)) {
    return payload;
  }
  return null;
}

export const useCartStore = defineStore("cartStore", {
  state: () => {
    const cache = parseJson(localStorage.getItem(CART_CACHE_KEY), {});
    return {
      items: Array.isArray(cache.items) ? cache.items : [],
      gifts: Array.isArray(cache.gifts) ? cache.gifts : [],
      subtotal: Number(cache.subtotal || 0),
      total: Number(cache.total || 0),
      discountAmount: Number(cache.discountAmount || 0),
      couponInfo: cache.couponInfo || null,
      coupons: Array.isArray(cache.coupons) ? cache.coupons : [],
      promoNotice: cache.promoNotice || null,
      isLoaded: false,
      isLoading: false,
      error: "",
      // Поля оставлены для совместимости старой верстки.
      loyaltyDiscount: Number(parseJson(localStorage.getItem("loyaltyDiscount"), 0) || 0),
      actionDiscount: 0,
      appliedPromoDiscount: Number(cache.discountAmount || 0),
      promotion: null,
    };
  },

  getters: {
    totalPrice(state) {
      if (state.isLoaded) return Number(state.subtotal || 0);
      return state.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
    },

    finalTotalPrice(state) {
      if (state.isLoaded) return Number(state.total ?? state.subtotal ?? 0);
      return Math.max(0, this.totalPrice - Number(state.discountAmount || 0));
    },

    oldTotalPrice(state) {
      return Number(state.discountAmount || 0) > 0 ? Number(state.subtotal || 0) : 0;
    },

    getItemById: (state) => (productId) =>
      state.items.find((item) => String(item.product_id) === String(productId)),
  },

  actions: {
    persist() {
      localStorage.setItem(CART_CACHE_KEY, JSON.stringify({
        items: this.items,
        gifts: this.gifts,
        subtotal: this.subtotal,
        total: this.total,
        discountAmount: this.discountAmount,
        couponInfo: this.couponInfo,
        coupons: this.coupons,
        promoNotice: this.promoNotice,
      }));
      // Старый ключ оставлен только как зеркало для совместимости.
      localStorage.setItem("cart", JSON.stringify(this.items));
    },

    resetState() {
      this.items = [];
      this.gifts = [];
      this.subtotal = 0;
      this.total = 0;
      this.discountAmount = 0;
      this.appliedPromoDiscount = 0;
      this.couponInfo = null;
      this.coupons = [];
      this.promoNotice = null;
      this.persist();
    },

    applyServerState(raw) {
      const payload = getPayload(raw);
      const products = Array.isArray(payload?.items) ? payload.items.map((item) => normalizeCartItem(item, false)) : [];
      const gifts = Array.isArray(payload?.gifts) ? payload.gifts.map((item) => normalizeCartItem(item, true)) : [];

      this.gifts = gifts;
      this.items = [...products, ...gifts];
      const calculatedSubtotal = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
      this.subtotal = Number(payload?.subtotal ?? calculatedSubtotal) || 0;
      this.discountAmount = Number(payload?.discount_amount ?? 0) || 0;
      this.appliedPromoDiscount = this.discountAmount;
      this.total = Number(payload?.total ?? Math.max(0, this.subtotal - this.discountAmount)) || 0;
      this.couponInfo = extractCoupon(payload);
      this.coupons = Array.isArray(payload?.coupons) ? payload.coupons : (this.couponInfo ? [this.couponInfo] : []);
      this.promoNotice = payload?.promo_notice || null;
      this.persist();
    },

    async loadCart({ force = false } = {}) {
      if (this.isLoading) return this.items;
      if (this.isLoaded && !force) return this.items;

      this.isLoading = true;
      this.error = "";
      const auth = useAuthStore();
      try {
        const data = auth.isAuthenticated && auth.userId
          ? await cartService.getUserCart(auth.userId)
          : await cartService.getGuestCart(ensureGuestSessionId());
        this.applyServerState(data);
        return this.items;
      } catch (error) {
        if (error?.response?.status === 404) {
          // Новая гостевая сессия ещё не имеет корзины на сервере — это нормальное пустое состояние.
          this.resetState();
          return this.items;
        }
        this.error = error?.response?.data?.message || error?.message || "Не удалось загрузить корзину";
        console.error("[cart] Ошибка загрузки корзины:", error);
        return this.items;
      } finally {
        this.isLoaded = true;
        this.isLoading = false;
      }
    },

    async ensureLoaded() {
      if (!this.isLoaded) await this.loadCart();
      return this.items;
    },

    async addToCart(product) {
      const productId = product?.product_id ?? product?.id;
      if (!productId) return false;

      const existing = this.getItemById(productId);
      if (existing) existing.quantity += 1;
      else this.items.push(normalizeCartItem({ ...product, quantity: 1 }));
      this.persist();

      const auth = useAuthStore();
      try {
        if (auth.isAuthenticated && auth.userId) {
          await cartService.addUserItem(auth.userId, productId, 1);
        } else {
          await cartService.addGuestItem(ensureGuestSessionId(), productId, 1);
        }
        await this.loadCart({ force: true });
        return true;
      } catch (error) {
        this.error = error?.response?.data?.message || error?.message || "Не удалось добавить товар";
        await this.loadCart({ force: true });
        return false;
      }
    },

    async updateQuantity(productId, quantity) {
      if (Number(quantity) <= 0) return this.removeFromCart(productId);
      const item = this.getItemById(productId);
      if (item) item.quantity = Number(quantity);
      this.persist();

      const auth = useAuthStore();
      try {
        if (auth.isAuthenticated && auth.userId) {
          await cartService.updateUserItem(auth.userId, productId, quantity);
        } else {
          await cartService.updateGuestItem(ensureGuestSessionId(), productId, quantity);
        }
        await this.loadCart({ force: true });
        return true;
      } catch (error) {
        this.error = error?.response?.data?.message || error?.message || "Не удалось изменить количество";
        await this.loadCart({ force: true });
        return false;
      }
    },

    async removeFromCart(productId) {
      this.items = this.items.filter((item) => String(item.product_id) !== String(productId));
      this.persist();

      const auth = useAuthStore();
      try {
        if (auth.isAuthenticated && auth.userId) {
          await cartService.removeUserItem(auth.userId, productId);
        } else {
          await cartService.removeGuestItem(ensureGuestSessionId(), productId);
        }
        await this.loadCart({ force: true });
        return true;
      } catch (error) {
        this.error = error?.response?.data?.message || error?.message || "Не удалось удалить товар";
        await this.loadCart({ force: true });
        return false;
      }
    },

    async clearCart() {
      const auth = useAuthStore();
      try {
        if (auth.isAuthenticated && auth.userId) {
          await cartService.clearUserCart(auth.userId);
        } else {
          await cartService.clearGuestCart(ensureGuestSessionId());
        }
      } catch (error) {
        if (error?.response?.status !== 404) console.warn("[cart] Ошибка очистки:", error);
      }
      this.resetState();
    },

    async applyCoupon(code) {
      const auth = useAuthStore();
      if (!auth.isAuthenticated || !auth.userId) {
        throw new Error("Для применения промокода необходимо авторизоваться");
      }

      const response = await cartService.applyUserCoupon(auth.userId, String(code || "").trim());
      const coupon = extractCoupon(response);
      this.couponInfo = coupon;
      if (coupon?.applied === false || coupon?.validation_error) {
        throw new Error(coupon.validation_error || "Промокод не применён");
      }
      await this.loadCart({ force: true });
      return response;
    },

    async removeCoupon() {
      const auth = useAuthStore();
      if (!auth.isAuthenticated || !auth.userId) return;
      await cartService.removeUserCoupon(auth.userId);
      await this.loadCart({ force: true });
    },

    async apply2plus1(productId) {
      const auth = useAuthStore();
      const response = auth.isAuthenticated && auth.userId
        ? await cartService.apply2Plus1User(auth.userId, productId)
        : await cartService.apply2Plus1Guest(ensureGuestSessionId(), productId);
      await this.loadCart({ force: true });
      return response;
    },

    async migrateGuestToUser(userId) {
      const sessionId = localStorage.getItem("guest_session_id");
      if (!sessionId || !userId) {
        await this.loadCart({ force: true });
        return;
      }
      try {
        await cartService.migrateGuestToUser(sessionId, userId);
        localStorage.removeItem("guest_session_id");
      } catch (error) {
        console.warn("[cart] Миграция гостевой корзины не выполнена:", error);
      }
      this.isLoaded = false;
      await this.loadCart({ force: true });
    },

    applyLoyaltyDiscount() {
      const profile = useUserStore().profile;
      const rates = { bronze: 3, silver: 5, gold: 7, platinum: 10 };
      this.loyaltyDiscount = Number(rates[profile?.loyalty_status] || 0);
      localStorage.setItem("loyaltyDiscount", JSON.stringify(this.loyaltyDiscount));
    },

    // Совместимость со старым кодом. Итоговые скидки теперь всегда считает сервер.
    applyDiscount() {},
    applyPromoDiscount() {},
    recalculateDiscount() {},
    applyGift21() {},
    applyGift21Logic() {},
    loadDiscounts() {},
    saveCart() { this.persist(); },
    clearDiscounts() {
      this.actionDiscount = 0;
      this.appliedPromoDiscount = this.discountAmount;
      this.promotion = null;
    },
  },
});
