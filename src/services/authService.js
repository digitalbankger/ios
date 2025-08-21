import api from "./api";

export const sendCode = async (cleanPhoneNumber) => {
  try {
    const response = await api.post("/v1/auth/send-code", {
      phone_number: cleanPhoneNumber,
      project_name: "daigo_app",
    });
    return response.data;
  } catch (error) {
    console.error("❌ Ошибка отправки кода:", error);
    return { error: "Network error" };
  }
};

export const sendCodeBeline = async (cleanPhoneNumber) => {
  try {
    const response = await api.post("/v1/auth/bilain/auth", {
      phone_number: cleanPhoneNumber,
      project_name: "daigo_app",
    });
    return response.data;
  } catch (error) {
    console.error("❌ Ошибка отправки кода:", error);
    return { error: "Network error" };
  }
};

export const sendEmailCode = async (email) => {
  try {
    const response = await api.post("/v1/auth/send-emailcode", {
      project_name: "daigo-app",
      phone_number: email,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Ошибка отправки email-кода:", error);
    return { error: "Network error" };
  }
};

export const verifyCode = async (phoneNumber, code) => {
  try {
    const response = await api.post("/v1/auth/verify-code", {
      phone_number: phoneNumber,
      code,
      project_name: "daigo_app",
    });
    return response.data;
  } catch (error) {
    console.error("❌ Ошибка верификации кода:", error);
    return { error: "Network error" };
  }
};

export const refreshAuthToken = async (refreshToken) => {
  try {
    const response = await api.post("/v1/auth/refresh-token", {
      refresh_token: refreshToken,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Ошибка обновления токена:", error);
    return { error: "Network error" };
  }
};
