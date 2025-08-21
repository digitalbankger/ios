<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-slider font-medium mt-3 flex flex-row items-center">
      Получатель 
      <span v-if="isConfirmed & !editMode" class="text-primary border-b border-primary text-sm cursor-pointer ml-auto" @click="$emit('edit')">
        Изменить данные
      </span>
      <span v-if="isConfirmed & editMode" class="text-primary border-b border-primary text-sm cursor-pointer ml-auto" @click="validateAndSave">
        Сохранить
      </span>
    </h2>

    <div v-if="editMode || !isConfirmed" class="mt-3 flex flex-col gap-3">
      <InputElement 
        ref="nameInput"
        :modelValue="recipient.name" 
        @update:modelValue="updateRecipient('name', $event)"
        @invalid="markRequired('name', $event)"
        required
        class="h-order rounded-md text-base xs:text-sm font-light tracking-wide" 
        placeholder="ФИО" 
      />
      <p v-if="errors.name" class="text-red-500 text-sm xs:text-xs">{{ errors.name }}</p>

      <InputField 
        ref="phoneInput"
        :modelValue="recipient.phone" 
        @update:modelValue="updateRecipient('phone', $event)"
        @invalid="markRequired('phone', $event)"
        required
        type="tel" 
        placeholder="+7 (___) ___-__-__" 
      />
      <p v-if="errors.phone" class="text-red-500 text-sm">{{ errors.phone }}</p>

      <InputElement 
        ref="emailInput"
        :modelValue="recipient.email" 
        @update:modelValue="updateRecipient('email', $event)"
        @invalid="markRequired('email', $event)"
        required
        class="h-order rounded-md text-base font-light tracking-wide" 
        type="email" 
        placeholder="Email" 
      />
      <p v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</p>

      <!-- <AddressAutocomplete 
        ref="cityInput"
        :modelValue="recipient.city"
        @update:modelValue="updateRecipient('city', $event)"
        @invalid="markRequired('city', $event)"
        type="city"
        required
        class="h-order rounded-md text-base font-light tracking-wide"
        :class="{'border-red-500': errors.city}" 
      />
      <p v-if="errors.city" class="text-red-500 text-sm">{{ errors.city }}</p> -->

      <BaseCheckbox 
        :modelValue="otherRecipient" 
        @update:modelValue="$emit('update:otherRecipient', $event)" 
        label="Заказ заберёт другой человек" 
      />

      <div v-if="otherRecipient" class="mt-3 flex flex-col gap-3">
        <InputElement 
          ref="otherRecipientNameInput"
          :modelValue="otherRecipientName" 
          @update:modelValue="$emit('update:otherRecipientName', $event)"
          @invalid="markRequired('otherRecipientName', $event)"
          required
          class="h-order rounded-md text-base font-light tracking-wide" 
          placeholder="ФИО другого получателя" 
        />
        <p v-if="errors.otherRecipientName" class="text-red-500 text-sm xs:text-xs">{{ errors.otherRecipientName }}</p>

        <InputField 
          ref="otherRecipientPhoneInput"
          :modelValue="otherRecipientPhone" 
          @update:modelValue="$emit('update:otherRecipientPhone', $event)"
          @invalid="markRequired('otherRecipientPhone', $event)"
          required
          type="tel" 
          placeholder="+7 (___) ___-__-__" 
        />
        <p v-if="errors.otherRecipientPhone" class="text-red-500 text-sm xs:text-xs">{{ errors.otherRecipientPhone }}</p>
      </div>
    </div>

    <div v-else class="flex flex-col gap-4 mt-2">
      <p class="text-base xs:text-sm flex flex-row justify-between w-full">Получатель: <span>{{ recipient.name }}</span></p>
      <p class="text-base xs:text-sm flex flex-row justify-between w-full">Телефон: <span>{{ recipient.phone }}</span></p>
      <p class="text-base xs:text-sm flex flex-row justify-between w-full">Email: <span>{{ recipient.email }}</span></p>
      <!-- <p class="text-base flex flex-row justify-between w-full">Город: <span>{{ recipient.city }}</span></p> -->
    </div>

    <hr v-if="isConfirmed" class="border-t border-gray-300 mt-4">
  </div>
</template>

<script setup>
import { defineProps, defineEmits, watch, ref } from 'vue';
import InputElement from '@/components/ui/InputElement.vue';
import InputField from '@/components/order/InputField.vue';
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue';

const props = defineProps({
  recipient: Object, 
  otherRecipient: Boolean,
  otherRecipientName: String,
  otherRecipientPhone: String,
  isConfirmed: Boolean,
  editMode: Boolean
});

const emit = defineEmits([
  'edit',
  'save',
  'update:recipient',
  'update:otherRecipient',
  'update:otherRecipientName',
  'update:otherRecipientPhone'
]);

const updateRecipient = (field, value) => {
  console.log(`✏️ Обновляем поле ${field}:`, value);
  
  const updatedRecipient = { ...props.recipient, [field]: value };
  emit('update:recipient', updatedRecipient);
};

const errors = ref({
  name: '',
  phone: '',
  email: '',
  city: ''
});

const markRequired = (field, event) => {
  event.preventDefault();
  errors.value[field] = 'Это поле обязательно';
};

const validateAndSave = () => {
  let hasError = false;
  
  Object.keys(errors.value).forEach((key) => {
    if (!props.recipient[key] || props.recipient[key].trim() === '') {
      errors.value[key] = 'Это поле обязательно';
      hasError = true;
    } else {
      errors.value[key] = ''; 
    }
  });

  if (!hasError) {
    console.log("✅ Данные переданы в `OrderCreate.vue`:", props.recipient);
    emit('save');
  }
};
</script>

