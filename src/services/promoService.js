import api from "./api";

export const fetchPromotions = async () => {
  try {
    const response = await api.get("/v1/shop/promotion");
    return response.data;
  } catch (error) {
    return [];
  }
};

export const applyPromotion = async (promoId, cartItems, totalAmount) => {
  try {
    const response = await api.post("/v1/shop/apply-promo", {
      promo_id: promoId,
      cart_items: cartItems.map(item => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
      })),
      total_amount: totalAmount,
    });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const checkCouponUsage = async (userId, couponCode) => {
    try {
      const response = await api.post("/v1/shop/order/coupon/check", {
        daigo_id: userId,
        coupon_code: couponCode,
      });
      return response.data;
    } catch (error) {
      return null;
    }
  };
  