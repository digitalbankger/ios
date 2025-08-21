import api from "./api";

export const fetchProducts = async () => {
  try {
    const response = await api.get("/v1/shop/products");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchProductById = async (id) => {
  try {
    const response = await api.get(`/v1/shop/products/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};