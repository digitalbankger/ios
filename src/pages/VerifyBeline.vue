<template>
  <div class="flex flex-col items-center space-y-6 p-8 pt-20">
    <img src="@/assets/img/daigoid.png" width="118"/>

    <h1 class="text-2xl font-semibold text-center">Проверка авторизации</h1>
    <p class="text-black text-center text-lg w-full">
      Мы отправили вам ссылку для авторизации в сообщении на номер <span class="font-medium">{{ dirtyIdentifier }}</span>
    </p>
    <div v-if="loading" class="flex justify-center items-center mt-10">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary"></div>
    </div>

    <div class="flex space-x-4">
    
    </div>

    <p v-if="timer > 0" class="text-gray-500 text-sm">
      Получить повторно можно через {{ timer }} сек
    </p>

    <Button 
      v-if="timer === 0" 
      variant="outline"
      @click="resendCode"
      class="w-full"
    >
      Отправить ссылку ещё раз
    </Button>

    <p class="text-sm font-medium mt-2 cursor-pointer text-gray-700 underline" @click="changeMethod">
      Изменить
    </p>

    <p class="text-sm text-blue-500 cursor-pointer hover:underline">
      Что делать, если код не приходит?
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button.vue";
import { useVerifyStore } from "@/store/verifyStore";

const verifyStore = useVerifyStore();
const router = useRouter();
const authStore = useAuthStore();

const identifier = verifyStore.phone || verifyStore.email;
const dirtyIdentifier = verifyStore.dirtyPhone || verifyStore.dirtyEmail;

const code = ref(["", "", "", ""]);
const timer = ref(60);
const activeIndex = ref(0);
const codeInputs = ref([]);

const isCodeValid = computed(() => code.value.join("").length === 4);

const verifyCode = async () => {
  try {
    const success = await authStore.verifyCode(identifier, code.value.join(""));

    if (success) {
      console.log("✅ Авторизация успешна");
      router.push("/profile");
    } else {
      alert("Неверный код. Попробуйте снова.");
    }
  } catch (error) {
    console.error("❌ Ошибка авторизации:", error);
    alert("Ошибка при проверке кода. Попробуйте позже.");
  }
};

const resendCode = async () => {
  try {
    if (verifyStore.phone) {
      await authStore.requestCode(verifyStore.phone);
    } else if (verifyStore.email) {
      await authStore.requestEmailCode(verifyStore.email);
    }
    timer.value = 60;
  } catch (error) {
    console.error("❌ Ошибка при повторной отправке кода:", error);
    alert("Ошибка при отправке кода.");
  }
};

const startTimer = () => {
  const interval = setInterval(() => {
    if (timer.value > 0) timer.value--;
    else clearInterval(interval);
  }, 1000);
};

onMounted(() => {
  startTimer();
  nextTick(() => {
    codeInputs.value[0]?.focus();
  });
});

const handleInput = (index) => {
  if (code.value[index].length === 1 && index < 3) {
    activeIndex.value = index + 1;
    nextTick(() => codeInputs.value[index + 1]?.focus());
  }
};

const handleBackspace = (index) => {
  if (code.value[index] === "" && index > 0) {
    activeIndex.value = index - 1;
    nextTick(() => codeInputs.value[index - 1]?.focus());
  }
};

const changeMethod = () => {
  router.push({ path: "/authenticate" });
};
</script>

<style scoped>
</style>
