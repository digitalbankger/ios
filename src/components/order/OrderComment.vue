<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-slider font-medium mt-3 flex flex-row items-center">
      Комментарий
      <span v-if="isConfirmed && !editMode" class="text-primary border-b border-primary text-sm cursor-pointer ml-auto" @click="$emit('edit')">
        Изменить
      </span>
      <span v-if="isConfirmed && editMode" class="text-primary border-b border-primary text-sm cursor-pointer ml-auto" @click="saveComment">
        Сохранить
      </span>
    </h2>

    <InputElement 
      v-if="editMode || !isConfirmed" 
      :modelValue="comment" 
      @update:modelValue="updateComment" 
      type="textarea" 
      placeholder="Введите комментарий..." 
    />
    <p v-else class="text-base">{{ comment || "Комментарий отсутствует" }}</p>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import InputElement from '@/components/ui/InputElement.vue';

const props = defineProps({
  comment: String,
  isConfirmed: Boolean,
  editMode: Boolean
});

const emit = defineEmits(['edit', 'save', 'update:comment']);

const updateComment = (value) => {
  emit('update:comment', value); 
};

const saveComment = () => {
  console.log("✅ Комментарий сохранён:", props.comment);
  emit('save');
};
</script>
