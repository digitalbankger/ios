<template>
  <div class="border-b border-gray-300 overflow-hidden">
    <button
      class="w-full flex justify-between items-center px-2.5 xs:px-1 py-4 text-left text-sm xs:text-xs"
      @click="$emit('toggle')"
    >
      {{ title }}
      <span class="transition-transform duration-300" :class="{ 'rotate-135': isOpen }">
        <img src="@/assets/icons/plus-dark.svg" />
      </span>
    </button>
    <transition name="accordion">
      <div v-if="isOpen" class="px-2.5 xs:px-1 py-4 border-t text-sm xs:text-xs">
        <slot>
          <div class="opacity-70" v-html="formattedContent"></div>
        </slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  content: String,
  isOpen: Boolean
});

const formattedContent = computed(() => {
  if (!props.content) return '';
  return props.content.replace(/\n/g, "<br>");
});
</script>

<style scoped>
button:focus {
  outline: none;
}
</style>
