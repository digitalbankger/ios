<template>
  <div class="flex flex-col gap-2 w-full">
    <label v-if="label" :for="id" class="text-sm font-medium text-gray-700">
      {{ label }}
    </label>

    <div 
      v-if="type !== 'textarea'" 
      class="relative flex items-center rounded-lg transition-all duration-300"
      :class="inputWrapperClass"
    >
      <slot name="icon-left"></slot>
      <input
        :id="id"
        v-bind="$attrs"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        v-model="inputValue"
        class="w-full py-2 px-3 border border-border h-30 bg-transparent outline-none xs:text-sm text-gray-900 placeholder-gray-400"
        :class="inputClass"
        @input="handleInput"
        @keyup.enter="emit('enter', inputValue)"
      />
      <slot name="icon-right"></slot>
    </div>

    <textarea
      v-else
      :id="id"
      v-bind="$attrs"
      :placeholder="placeholder"
      :disabled="disabled"
      v-model="inputValue"
      :rows="props.rows"
      class="w-full py-2 px-3 border border-border bg-transparent outline-none xs:text-sm text-gray-900 placeholder-gray-400 rounded-md"
      :class="inputClass"
      @input="handleInput"
    ></textarea>

    <p v-if="error" class="text-sm xs:text-xs text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, watch } from "vue";

const props = defineProps({
  modelValue: String,
  type: { type: String, default: "text" },
  label: String,
  placeholder: String,
  error: String,
  disabled: Boolean,
  id: String,
  rows: { type: Number, default: 5 },
});

const emit = defineEmits(["update:modelValue", "enter"]);
const inputValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue;
  }
);

const handleInput = () => {
  emit("update:modelValue", inputValue.value);
};

const inputWrapperClass = computed(() => ({
  "border-gray-300 focus-within:border-blue-500": !props.error && !props.disabled,
  "border-red-500": props.error,
  "border-gray-200 bg-gray-100 cursor-not-allowed": props.disabled,
}));

const inputClass = computed(() => ({
  "text-gray-900": !props.disabled,
  "text-gray-400": props.disabled,
}));
</script>

<style scoped>
input:focus {
  outline: none;
}
</style>