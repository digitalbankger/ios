<template>
  <div class="relative flex items-center justify-center h-11">
    <Button variant="icon" class="absolute left-0" @click="$emit('goBack')">
      <img src="@/assets/icons/back.svg" alt="Назад" />
    </Button>
    <h1 class="text-base font-medium">Оформление заказа</h1>
  </div>
</template>

<script setup>
defineEmits(['goBack']);
</script>
