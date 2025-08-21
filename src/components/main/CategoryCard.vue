<template>
  <div 
    class="relative flex items-start py-3 px-3.5 bg-hoverbtn rounded-lg cursor-pointer w-full min-h-[100px] xs:min-h-[90px] hover:bg-gray-100 transition"
    @click="goToCategory"
  >
    <img :src="image.src" :class="image.class" alt="" />
    <span class="text-lg xs:text-sm leading-6 font-normal w-40 xs:w-28" v-html="title"></span>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { defineProps } from "vue";

const router = useRouter();

const props = defineProps({
  title: String,
  image: Object,
  route: Object,
});

const goToCategory = () => {
  if (props.route) {
    router.push(props.route);
  }
};
</script>