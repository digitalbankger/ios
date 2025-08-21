<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-10 flex items-end justify-center bottom-20">
    <div
        class="bg-white shadow-2xl w-full max-w-md h-3/4 rounded-t-[30px] p-34 pt-4 relative"
        @touchstart="startSwipe"
        @touchmove="handleSwipe"
    >
        <div class="flex justify-center cursor-pointer mb-6">
            <div class="w-8 h-1 bg-gray-500 rounded-full">
            </div>
        </div>
            <h2 class="text-lg font-medium mb-3">Карта самовывоза</h2>
            <div id="yandex-map" class="w-full h-[400px]"></div>
        </div>
    </div>
  </transition>
</template>

<script setup>
import { onMounted, defineProps, ref, defineEmits } from "vue";

const props = defineProps({
  isOpen: Boolean,
});

const startY = ref(0);
const endY = ref(0);

const startSwipe = (event) => {
  startY.value = event.touches[0].clientY;
};

const handleSwipe = (event) => {
  endY.value = event.touches[0].clientY;

  if (endY.value - startY.value > 100) {
    emit("close");
  }
};

const emit = defineEmits(["close"]);

onMounted(() => {
  if (window.ymaps) {
    window.ymaps.ready(initMap);
  } else {
    const script = document.createElement("script");
    script.src = "https://api-maps.yandex.ru/2.1/?apikey=6ec23ec7-96e5-4bd4-a2bb-026713d83fba&lang=ru_RU";
    script.onload = () => window.ymaps.ready(initMap);
    document.head.appendChild(script);
  }
});

const initMap = () => {
  new window.ymaps.Map("yandex-map", {
    center: [55.770906, 37.633865],
    zoom: 16,
    controls: ["zoomControl"],
  });
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
