<template>
  <div class="flex flex-col w-full h-full px-4 py-6">
    <div class="relative flex items-center justify-center h-11">
 
    </div>

    <div class="flex flex-col items-center justify-center gap-3 h-96 mt-16 my-auto">
        <img src="@/assets/img/thank.png" class="w-1/2"/>
        <h2 class="text-2xl font-medium text-center">Спасибо за заказ!</h2>
        <p class="text-sm text-center w-3/5 mb-3">
            Заказ №1234567 уже передан в доставку и скоро будет у вас
        </p>
        <Button 
            variant="solid" 
            class="!w-3/4 !h-order"
            @click="goToCatalog"
        >
            Вернуться в каталог
        </Button>
    </div>

  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Button from "@/components/ui/Button.vue"

const router = useRouter();

const goToCatalog = () => {
  router.push("/catalog");
};

const goBack = () => {
  router.go(-1);
};
</script>
