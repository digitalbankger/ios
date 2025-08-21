<template>
  <div class="flex flex-col gap-4 mt-2">
    <p class="text-base flex flex-row">Получатель: <span class="ml-auto">{{ recipient.name }}</span></p>
    <p class="text-base flex flex-row">Телефон: <span class="ml-auto">{{ recipient.phone }}</span></p>
    <p class="text-base flex flex-row">Email: <span class="ml-auto">{{ recipient.email }}</span></p>
  </div>
</template>

<script setup>
defineProps({
  recipient: Object
});
</script>
