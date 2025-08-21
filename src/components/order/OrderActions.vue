<template>
  <div class="flex flex-col gap-2">
    <Button 
      v-if="!isConfirmed" 
      class="flex justify-center items-center h-50 text-lg py-3 mt-2" 
      type="submit"
      :disabled="disabled"
      @click="$emit('confirmOrder')"
    >
      Оформить заказ
    </Button>

    <Button 
      v-else 
      :disabled="disabled"
      @click="$emit('submitOrder')"
    >
      Подтвердить заказ
    </Button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import Button from '@/components/ui/Button.vue';

defineProps({
  isConfirmed: Boolean,
  disabled: Boolean // 👈 Новый проп
});

defineEmits(['confirmOrder', 'submitOrder']);
</script>
