<template>
  <div class="flex flex-col items-center space-y-6 p-8 xs:p-4 pt-20">
    <img src="@/assets/img/daigoid.png" width="118" alt="Daigo ID" />

    <h1 class="text-2xl xs:text-xl font-semibold text-center">Подтверждение кода</h1>
    <p class="text-black text-center text-base w-full">
      {{ deliveryHint }}<br />
      Номер: <span class="font-medium">{{ dirtyIdentifier }}</span>
    </p>

    <div class="flex space-x-4 xs:space-x-2">
      <input
        v-for="(_, index) in code"
        :key="index"
        ref="codeInputs"
        v-model="code[index]"
        type="tel"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="1"
        autocomplete="one-time-code"
        class="w-14 h-14 xs:w-12 xs:h-12 text-xl font-medium text-center bg-hoverbtn rounded-md focus:bg-white focus:outline-none"
        :class="{ 'border border-primary': index === activeIndex }"
        :disabled="authStore.isVerifying"
        @input="handleInput(index, $event)"
        @keydown.backspace="handleBackspace(index)"
        @paste="handlePaste"
      />
    </div>

    <p v-if="errorMessage" class="text-red-500 text-sm text-center">
      {{ errorMessage }}
    </p>

    <p v-if="timer > 0" class="text-gray-500 text-sm text-center">
      Получить повторно можно через {{ timer }} сек.
    </p>

    <Button
      variant="solid"
      :disabled="!isCodeValid || authStore.isVerifying"
      @click="confirmCode"
      class="w-full"
    >
      {{ authStore.isVerifying ? "Проверяем…" : "Подтвердить" }}
    </Button>

    <Button
      v-if="timer === 0"
      variant="outline"
      :disabled="authStore.isSendingCode"
      @click="resendCode"
      class="w-full"
    >
      {{ authStore.isSendingCode ? "Запрашиваем звонок…" : "Получить код звонком" }}
    </Button>

    <p class="text-xs text-gray-500 text-center">
      При повторном запросе поступит звонок. Код — последние 4 цифры входящего номера.
    </p>

    <button class="text-sm font-medium mt-2 text-gray-700 underline" @click="changePhone">
      Изменить номер
    </button>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { useCartStore } from "@/store/cartStore";
import { useVerifyStore } from "@/store/verifyStore";
import { initPushNotifications } from "@/services/push-init";
import Button from "@/components/ui/Button.vue";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const cartStore = useCartStore();
const verifyStore = useVerifyStore();

const code = ref(["", "", "", ""]);
const timer = ref(30);
const activeIndex = ref(0);
const codeInputs = ref([]);
const errorMessage = ref("");
let timerId = null;

const identifier = computed(() => verifyStore.phone || authStore.pendingPhone || "");
const dirtyIdentifier = computed(() => verifyStore.dirtyPhone || formatPhone(identifier.value));
const isCodeValid = computed(() => code.value.join("").length === 4);
const deliveryHint = computed(() =>
  authStore.lastSendMethod === "call"
    ? "Введите последние 4 цифры входящего номера."
    : "Введите код из SMS."
);

function formatPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length !== 11) return digits;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

function restartTimer(seconds = 30) {
  if (timerId) clearInterval(timerId);
  timer.value = seconds;
  timerId = setInterval(() => {
    timer.value = Math.max(0, timer.value - 1);
    if (timer.value === 0) {
      clearInterval(timerId);
      timerId = null;
    }
  }, 1000);
}

async function confirmCode() {
  errorMessage.value = "";
  const result = await authStore.verifyCode(identifier.value, code.value.join(""));

  if (!result.success) {
    errorMessage.value = result.message || "Неверный код. Попробуйте снова.";
    code.value = ["", "", "", ""];
    activeIndex.value = 0;
    await nextTick();
    codeInputs.value[0]?.focus();
    return;
  }

  const userId = result.data?.daigo_id || authStore.userId;
  await cartStore.migrateGuestToUser(userId);
  verifyStore.clear();
  await userStore.loadProfile();
  initPushNotifications();
  await router.replace("/profile");
}

async function resendCode() {
  errorMessage.value = "";
  const result = await authStore.resendCode(identifier.value);
  if (!result.success) {
    errorMessage.value = result.message || "Не удалось запросить звонок.";
    return;
  }
  code.value = ["", "", "", ""];
  activeIndex.value = 0;
  restartTimer(30);
  await nextTick();
  codeInputs.value[0]?.focus();
}

function handleInput(index, event) {
  const digit = String(event?.target?.value || "").replace(/\D/g, "").slice(-1);
  code.value[index] = digit;
  if (digit && index < 3) {
    activeIndex.value = index + 1;
    nextTick(() => codeInputs.value[index + 1]?.focus());
  }
}

function handleBackspace(index) {
  if (!code.value[index] && index > 0) {
    activeIndex.value = index - 1;
    nextTick(() => codeInputs.value[index - 1]?.focus());
  }
}

function handlePaste(event) {
  const digits = event.clipboardData?.getData("text")?.replace(/\D/g, "").slice(0, 4) || "";
  if (!digits) return;
  event.preventDefault();
  code.value = [0, 1, 2, 3].map((index) => digits[index] || "");
  activeIndex.value = Math.min(digits.length, 4) - 1;
  nextTick(() => codeInputs.value[Math.max(activeIndex.value, 0)]?.focus());
}

async function changePhone() {
  verifyStore.clear();
  authStore.pendingPhone = "";
  localStorage.removeItem("pending_phone");
  await router.replace("/authenticate");
}

onMounted(async () => {
  if (!identifier.value) {
    await router.replace("/authenticate");
    return;
  }
  restartTimer(30);
  await nextTick();
  codeInputs.value[0]?.focus();
});

onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId);
});
</script>
