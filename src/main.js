import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/main.css';

import { startVisitTimers } from './utils/metrics';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.mount('#app');

startVisitTimers();

document.addEventListener('deviceready', () => {

  window.handleOpenURL = function (url) {
    setTimeout(() => {
      router.push('/');
    }, 0);
  };

  if (window.FirebasePlugin) {
    window.FirebasePlugin.hasPermission((granted) => {
      if (!granted) {
        window.FirebasePlugin.grantPermission(
          (res) => {
            console.log("🔔 Разрешение на уведомления получено:", res);
          },
          (err) => {
            console.error("❌ Ошибка при получении разрешения:", err);
          }
        );
      } else {
        console.log("🔔 Разрешение уже было выдано");
      }
    }, (error) => {
      console.error("❌ Ошибка при проверке разрешения:", error);
    });
  } else {
    console.warn("⚠️ FirebasePlugin не доступен");
  }
});
