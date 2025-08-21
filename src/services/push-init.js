import api from "@/services/api";
import { useUserStore } from "@/store/userStore";

let cachedToken = null;
let tokenSent = false;

export function initPushNotifications() {
  document.addEventListener("deviceready", async () => {
    console.log("[Cordova] deviceready — пуш-инициализация");

    window.FirebasePlugin.getToken(async token => {
      console.log("📲 FCM Token получен:", token);
      cachedToken = token;

      trySendToken();
    }, err => {
      console.error("❌ Ошибка при получении токена:", err);
    });

    window.FirebasePlugin.onTokenRefresh(async token => {
      console.log("Обновлён FCM Token:", token);
      cachedToken = token;
      trySendToken(true);
    });

    window.FirebasePlugin.onMessageReceived(data => {
      console.log("📥 Push-сообщение:", data);

      const existing = JSON.parse(localStorage.getItem("notifications") || "[]");
      existing.unshift({
        id: Date.now(),
        title: data.title || "Без заголовка",
        body: data.body || "",
        raw: data,
        read: false
      });
      localStorage.setItem("notifications", JSON.stringify(existing));
    }, err => {
      console.error("❌ Ошибка при получении push-сообщения:", err);
    });

    const userStore = useUserStore();
    watchDaigoId(userStore);
  });
}

function trySendToken(force = false) {
  const userStore = useUserStore();
  const daigoId = userStore.profile?.id;

  if (!cachedToken || !daigoId) {
    console.warn("Ожидаем токен или daigo_id...");
    return;
  }

  if (tokenSent && !force) return;

  const payload = {
    daigo_id: daigoId,
    token: cachedToken,
    platform: "Android",
  };

  api.post("/v1/auth/notifications/register-token", payload)
    .then(() => {
      console.log("Токен успешно отправлен на сервер");
      tokenSent = true;
    })
    .catch(err => {
      console.error("Ошибка при отправке токена:", err);
    });
}

function watchDaigoId(userStore) {
  const check = setInterval(() => {
    if (userStore.profile?.id) {
      trySendToken();
      clearInterval(check);
    }
  }, 10000);
}
