<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div class="bg-white w-80 py-6 px-4 mx-2 rounded-lg shadow-lg flex flex-col items-center relative">
        <button @click="closePopup" class="absolute top-2 right-2 text-gray-500 text-sm">✕</button>
        
        <h2 class="text-slider text-center font-medium mb-2">{{ title }}</h2>
        <p class="text-sm text-center w-[90%] font-normal">{{ message }}</p>

        <Button 
          v-if="buttonText" 
          variant="solid" 
          class="mt-4 w-full xs:text-sm"
          @click="handleAction"
        >
          {{ buttonText }}
        </Button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import Button from "@/components/ui/Button.vue";

const props = defineProps({
  isOpen: Boolean,
  title: String,
  message: String,
  buttonText: String,
  buttonAction: Function
});

const emit = defineEmits(["close"]);

const closePopup = () => {
  emit("close");
};

const handleAction = () => {
  if (typeof props.buttonAction === "function") {
    props.buttonAction();
  } else {
    closePopup();
  }
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