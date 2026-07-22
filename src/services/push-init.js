import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

let initialized = false;
let cachedToken = null;
let tokenSentForUser = null;

function currentFirebasePlugin() {
  return window.FirebasePlugin || null;
}

async function sendToken(force = false) {
  const auth = useAuthStore();
  const daigoId = auth.userId || localStorage.getItem("daigo_id");
  if (!cachedToken || !daigoId) return;
  if (!force && tokenSentForUser === String(daigoId)) return;

  try {
    await api.post("/v1/auth/notifications/register-token", {
      daigo_id: daigoId,
      token: cachedToken,
      platform: window.cordova?.platformId === "ios" ? "iOS" : "Android",
    });
    tokenSentForUser = String(daigoId);
    console.log("[push] Токен зарегистрирован");
  } catch (error) {
    console.error("[push] Ошибка регистрации токена:", error);
  }
}

function initializePlugin() {
  const plugin = currentFirebasePlugin();
  if (!plugin || initialized) return;
  initialized = true;

  plugin.getToken(
    (token) => {
      cachedToken = token;
      sendToken();
    },
    (error) => console.error("[push] Не удалось получить FCM token:", error)
  );

  plugin.onTokenRefresh(
    (token) => {
      cachedToken = token;
      sendToken(true);
    },
    (error) => console.error("[push] Ошибка обновления FCM token:", error)
  );

  plugin.onMessageReceived(
    (data) => {
      const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
      notifications.unshift({
        id: Date.now(),
        title: data.title || "Без заголовка",
        body: data.body || "",
        raw: data,
        read: false,
      });
      localStorage.setItem("notifications", JSON.stringify(notifications));
    },
    (error) => console.error("[push] Ошибка получения сообщения:", error)
  );
}

export function initPushNotifications() {
  // После входа deviceready обычно уже произошёл, поэтому сначала пробуем сразу.
  if (currentFirebasePlugin()) initializePlugin();
  else document.addEventListener("deviceready", initializePlugin, { once: true });

  // Если плагин уже инициализирован, но пользователь только что вошёл.
  sendToken();
}
