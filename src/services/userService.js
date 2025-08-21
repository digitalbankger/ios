import api from "./api";

export const fetchUser = async (daigoId) => {
  try {
    const response = await api.get(`/v1/auth/user/${daigoId}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const updateUser = async (daigoId, updatedData) => {
  try {
    const response = await api.patch(`/v1/auth/user/${daigoId}/update`, updatedData);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const addUserAddress = async (daigoId, addresses) => {
  try {
    const response = await api.patch(`/v1/auth/user/${daigoId}`, { addresses });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const removeUserAddress = async (daigoId, addresses) => {
  try {
    const response = await api.patch(`/v1/auth/user/${daigoId}`, { addresses });
    return response.data;
  } catch (error) {
    return null;
  }
};

