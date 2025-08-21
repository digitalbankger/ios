<template>
  <div class="input-container">
    <label v-if="label" :for="id" class="input-label xs:!text-[10px]">{{ label }}</label>
    <div class="input-wrapper">
      <slot name="icon-left"></slot>
      
      <input
        :id="id"
        v-bind="$attrs"
        type="tel"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClass"
        v-model="formattedNumber"
        @input="handleInput"
      />

      <slot name="icon-right"></slot>
    </div>
    <p v-if="error" class="input-error xs:!text-[10px]">{{ error }}</p>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref } from "vue";

const props = defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  error: String,
  disabled: Boolean,
  id: String,
});

const emit = defineEmits(["update:modelValue"]);

const formattedNumber = ref("");

const handleInput = (event) => {
  let value = event.target.value.replace(/\D/g, "");

  if (value.startsWith("8")) {
    value = "7" + value.slice(1);
  } else if (!value.startsWith("7")) {
    value = "7" + value;
  }

  formattedNumber.value = formatPhoneNumber(value);
  emit("update:modelValue", formattedNumber.value);
};

const formatPhoneNumber = (number) => {
  let formatted = "+7 ";

  if (number.length > 1) formatted += `(${number.slice(1, 4)}`;
  if (number.length > 4) formatted += `) ${number.slice(4, 7)}`;
  if (number.length > 7) formatted += `-${number.slice(7, 9)}`;
  if (number.length > 9) formatted += `-${number.slice(9, 11)}`;

  return formatted.trim();
};

const inputClass = computed(() => ({
  "input-base": true,
  "input-error-border": props.error,
  "input-disabled": props.disabled,
}));
</script>

<style scoped>
.input-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.input-label {
  font-size: 12px;
  font-weight: 400;
  color: black;
  opacity: 0.5;
}

.input-wrapper {
  display: flex;
  align-items: center;
  padding: 15px;
  transition: border 0.3s ease-in-out;
  border: 1px solid #11111134;
  border-radius: 8px;
}

.input-wrapper:focus-within {
  border-color: #659CFF;
}

.input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  font-weight: 300;
}

.input-error {
  font-size: 12px;
  color: red;
}

.input-error-border {
  border-color: red !important;
}

.input-disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

@media (max-width: 325px) {
  .input-wrapper input {
    font-size: 14px;
  }
}
</style>