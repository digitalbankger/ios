import api from "@/services/api";

export const fetchBonusHistory = async (daigoId) => {
  const response = await api.get(`/v1/auth/user/bonuses_history/${daigoId}`);
  return response.data.history;
};
