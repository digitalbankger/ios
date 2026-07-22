import api from "./api";

/** Первая отправка кода, как на актуальном сайте: SMS. */
export const sendCode = async (phoneNumber) => {
  const { data } = await api.post("/v1/auth/send-code", {
    phone_number: String(phoneNumber).replace(/\D/g, ""),
  });
  return data;
};

/** Повторная отправка, как на сайте: flash-call, код — последние 4 цифры номера. */
export const sendCodeFlashCall = async (phoneNumber) => {
  const { data } = await api.post("/v1/auth/send-fc", {
    phone_number: String(phoneNumber).replace(/\D/g, ""),
  });
  return data;
};

/** Оставлено как alias для старых импортов приложения. */
export const sendCodeBeline = sendCodeFlashCall;

export const verifyCode = async (phoneNumber, code) => {
  const { data } = await api.post("/v1/auth/verify-code", {
    phone_number: String(phoneNumber).replace(/\D/g, ""),
    code: String(code).replace(/\D/g, ""),
    project_name: "daigo_web",
  });
  return data;
};

export const refreshAuthToken = async (refreshToken) => {
  const { data } = await api.post("/v1/auth/refresh", {
    refresh_token: refreshToken,
  });
  return data;
};
