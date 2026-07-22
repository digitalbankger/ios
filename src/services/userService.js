import api from "./api";

export const fetchUser = async (daigoId) => {
  const { data } = await api.get(`/v1/auth/user/${encodeURIComponent(String(daigoId))}`);
  return data;
};

export const updateUser = async (daigoId, updatedData) => {
  const { data } = await api.patch(
    `/v1/auth/user/${encodeURIComponent(String(daigoId))}/update`,
    updatedData
  );
  return data;
};

export const addUserAddress = async (daigoId, address) => {
  const { data } = await api.post(
    `/v1/auth/user/${encodeURIComponent(String(daigoId))}/addresses`,
    address
  );
  return data;
};
