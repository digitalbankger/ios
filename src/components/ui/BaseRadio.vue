<template>
  <div class="flex items-center gap-2 mt-2 cursor-pointer" @click="selectOption">
    <div class="relative w-6 h-6 border border-black rounded-sm flex items-center justify-center transition-all duration-300"
         :class="{ 'bg-transparent': selected }">
      <svg v-if="selected" class="w-4 h-4 stroke-black" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    
    <label class="text-base font-normal cursor-pointer select-none" :for="id">
      {{ label }}
    </label>

    <input type="radio" :id="id" :value="value" :checked="selected" class="hidden" @change="selectOption" />
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  modelValue: String,
  value: String,
  label: String,
  id: String,
});

const emit = defineEmits(["update:modelValue"]);

const selected = computed(() => props.modelValue === props.value);

const selectOption = () => {
  emit("update:modelValue", props.value);
};
</script>
