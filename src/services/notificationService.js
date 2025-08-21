import api from "./api";

export const fetchNotifications = async (daigo_id, offset = 0, limit = 20) => {
  try {
    const response = await api.get(`/v1/auth/notifications/history/${daigo_id}`, {
      params: { offset, limit }
    });
    return response.data.data;
  } catch (error) {
    console.error("Ошибка при получении уведомлений:", error);
    return { notifications: [], pagination: { count: 0, limit, offset } };
  }
};
