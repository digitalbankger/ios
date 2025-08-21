<script setup>
import { ref, onMounted } from 'vue';
import { fetchNotifications } from '@/services/notificationService';
import { useAuthStore } from '@/store/authStore';

const notifications = ref([]);
const pagination = ref({ count: 0, limit: 20, offset: 0 });
const loading = ref(false);

const authStore = useAuthStore();
const daigoId = authStore.user?.daigo_id;

const loadNotifications = async () => {
  loading.value = true;
  const result = await fetchNotifications(daigoId, pagination.value.offset, pagination.value.limit);
  notifications.value = result.notifications;
  pagination.value = result.pagination;
  loading.value = false;
};

onMounted(() => {
  loadNotifications();
});
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Уведомления</h1>

    <div v-if="loading" class="text-gray-500">Загрузка...</div>

    <div v-else>
      <div v-if="notifications.length === 0" class="text-gray-500">Нет уведомлений</div>
      <div v-else class="space-y-4">
        <div v-for="notification in notifications" :key="notification.id" class="bg-white p-4 rounded shadow">
          <div class="font-semibold">{{ notification.title }}</div>
          <div class="text-gray-600">{{ notification.body }}</div>
          <div class="text-sm text-gray-400 mt-2">
            {{ new Date(notification.sent_at).toLocaleString('ru-RU') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
