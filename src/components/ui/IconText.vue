<template>
  <div class="flex items-center gap-3 text-sm xs:text-xs">
    <img :src="icon" alt="icon" class="w-5 xs:w-4 h-5 xs:w-4" />
    <span>{{ text }}</span>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  text: String,
});
</script>  