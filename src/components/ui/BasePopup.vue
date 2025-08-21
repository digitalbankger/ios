<template>
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div class="bg-white w-3/4 p-4 rounded-lg shadow-lg relative">
          <!-- <button @click="closePopup" class="absolute top-2 right-2 text-gray-500">
            ✕
          </button> -->
          <slot />
        </div>
      </div>
    </transition>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from "vue";
  
  const props = defineProps({
    isOpen: Boolean
  });
  
  const emit = defineEmits(["close"]);
  
  const closePopup = () => {
    emit("close");
  };
  </script>
  
  <style scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease-in-out;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
  </style>  