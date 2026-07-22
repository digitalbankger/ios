import api from "@/services/api";

const enc = (value) => encodeURIComponent(String(value));

export const cartService = {
  async getUserCart(userId) {
    const { data } = await api.get(`/v1/shop/cart/${enc(userId)}`);
    return data;
  },

  async getGuestCart(sessionId) {
    const { data } = await api.get(`/v1/shop/guest-cart/${enc(sessionId)}`);
    return data;
  },

  async addUserItem(userId, productId, quantity = 1) {
    const { data } = await api.post(`/v1/shop/cart/${enc(userId)}`, {
      product_id: String(productId),
      quantity: Number(quantity) || 1,
    });
    return data;
  },

  async addGuestItem(sessionId, productId, quantity = 1) {
    const { data } = await api.post(`/v1/shop/guest-cart/${enc(sessionId)}`, {
      product_id: String(productId),
      quantity: Number(quantity) || 1,
    });
    return data;
  },

  async updateUserItem(userId, productId, quantity) {
    const { data } = await api.put(`/v1/shop/cart/${enc(userId)}/${enc(productId)}`, {
      quantity: Number(quantity),
    });
    return data;
  },

  async updateGuestItem(sessionId, productId, quantity) {
    const { data } = await api.put(`/v1/shop/guest-cart/${enc(sessionId)}/${enc(productId)}`, {
      quantity: Number(quantity),
    });
    return data;
  },

  async removeUserItem(userId, productId) {
    const { data } = await api.delete(`/v1/shop/cart/${enc(userId)}/${enc(productId)}`);
    return data;
  },

  async removeGuestItem(sessionId, productId) {
    const { data } = await api.delete(`/v1/shop/guest-cart/${enc(sessionId)}/${enc(productId)}`);
    return data;
  },

  async clearUserCart(userId) {
    const { data } = await api.delete(`/v1/shop/cart/${enc(userId)}`);
    return data;
  },

  async clearGuestCart(sessionId) {
    const { data } = await api.delete(`/v1/shop/guest-cart/${enc(sessionId)}`);
    return data;
  },

  async applyUserCoupon(userId, code) {
    const { data } = await api.post(`/v1/shop/cart/${enc(userId)}/coupon/apply`, {
      coupon_code: String(code).trim(),
    });
    return data;
  },

  async removeUserCoupon(userId) {
    const { data } = await api.delete(`/v1/shop/cart/${enc(userId)}/coupon`);
    return data;
  },

  async apply2Plus1User(userId, productId) {
    const { data } = await api.post(`/v1/shop/cart/${enc(userId)}/apply-2plus1`, {
      product_id: String(productId),
    });
    return data;
  },

  async apply2Plus1Guest(sessionId, productId) {
    const { data } = await api.post(`/v1/shop/guest-cart/${enc(sessionId)}/apply-2plus1`, {
      product_id: String(productId),
    });
    return data;
  },

  async migrateGuestToUser(sessionId, userId) {
    const { data } = await api.post(`/v1/shop/guest-cart/${enc(sessionId)}/migrate`, {
      daigo_id: userId,
    });
    return data;
  },
};
