import api from "@/services/api";

export const createOrder = async (orderData) => {
  try {

    if (!orderData.daigo_id) {
      throw new Error("Ошибка: `daigo_id` не указан!");
    }

    const response = await api.post("/v1/shop/order", orderData);

    return response.data;
  } catch (error) {
    console.error("Ошибка при оформлении заказа:", error);
    throw error;
  }
};

export const fetchOrderHistory = async (daigoId) => {
  const { data } = await api.get(`/v1/shop/order/history/${daigoId}`);
  return data;
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await api.post(`/v1/shop/order/${orderId}/cancel/`);
    return response.data;
  } catch (error) {
    console.error("Ошибка при отмене заказа:", error);
    throw error;
  }
};