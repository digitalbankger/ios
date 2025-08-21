<template>
  <div class="mt-2">
    <p class="text-base">
      {{ methods.find(m => m.id === paymentMethod)?.description || "Не выбран" }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  paymentMethod: String,
  methods: Array
});
</script>
