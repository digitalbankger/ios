<!-- <template>
  <div class="flex flex-col items-center space-y-5 p-8 pt-20">
    <img src="@/assets/img/daigoid.png" width="118"/>
    <p class="text-slider leading-8 font-medium w-3/4 text-center">
      Войти или создать профиль
    </p>
    <p class="w-full text-center text-lg">
      После входа вы сможете заказывать товары с бесплатной доставкой и отслеживать историю своих заказов.
    </p>

    <InputField 
      v-model="phoneNumber"
      label="Введите номер телефона"
      type="tel"
      placeholder="+7 (___) ___-__-__"
      :error="phoneError"
    />

    <Button variant="solid" :disabled="!isPhoneValid" @click="requestCode">
      Войти по Daigo ID
    </Button>

    <p class="text-center text-xs opacity-60 w-3/4">
      Нажимая “Войти по Daigo ID” вы даете согласие на
      <span class="text-primary">сбор, обработку и хранение персональных данных </span>.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button.vue";
import InputField from "@/components/ui/InputField.vue";
import { useVerifyStore } from "@/store/verifyStore";

const verifyStore = useVerifyStore();
const phoneNumber = ref("");
const phoneError = ref("");
const authStore = useAuthStore();
const router = useRouter();

const isPhoneValid = computed(() => /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phoneNumber.value));

const requestCode = async () => {
  phoneError.value = "";

  if (!isPhoneValid.value) {
    phoneError.value = "Введите корректный номер";
    return;
  }

  try {
    const cleanPhoneNumber = phoneNumber.value.replace(/\D/g, '');

    const response = await authStore.requestCode(cleanPhoneNumber);

    if (response?.code && response.message?.trim().toLowerCase() === "code send successfully") {
      verifyStore.setPhone(cleanPhoneNumber, phoneNumber.value);
      router.push({ path: "/verify" });
    } else {
      phoneError.value = "Ошибка отправки кода";
    }
  } catch (error) {
    phoneError.value = "Ошибка отправки кода. Попробуйте снова.";
  }
};



// Логирование изменения `phoneNumber`
watchEffect(() => {
  console.log("📞 Номер телефона изменился:", phoneNumber.value);
});
</script>

<style scoped>
</style> -->


<!-- 

<template>
  <div class="flex flex-col items-center space-y-5 p-4 pt-20">
    <img src="@/assets/img/daigoid.png" width="118"/>
    
    <p class="text-slider leading-8 font-medium w-3/4 text-center">
      Войти или создать профиль
    </p>
    
    <p class="w-full text-center text-lg">
      После входа вы сможете заказывать товары с бесплатной доставкой и отслеживать историю своих заказов.
    </p>

    <InputElement 
      v-model="email"
      type="email"
      placeholder="example@email.com"
      class="h-order rounded-md"
    />
    <p v-if="emailError" class="text-sm text-red-500">{{ emailError }}</p>

    <Button variant="solid" :disabled="!isEmailValid" @click="requestCode">
      Войти по Daigo ID
    </Button>

    <p class="text-center text-xs opacity-60 w-3/4">
      Нажимая “Войти по Daigo ID” вы даете согласие на
      <span class="text-primary">сбор, обработку и хранение персональных данных</span>.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button.vue";
import InputElement from "@/components/ui/InputElement.vue";
import { useVerifyStore } from "@/store/verifyStore";

const verifyStore = useVerifyStore();
const email = ref("");
const emailError = ref("");
const authStore = useAuthStore();
const router = useRouter();

const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value));

const requestCode = async () => {
  emailError.value = "";

  if (!isEmailValid.value) {
    emailError.value = "Введите корректный email";
    return;
  }

  try {
    const response = await authStore.requestEmailCode(email.value);

    if (
      response?.message?.toLowerCase().includes("code sent successfully")
    ) {
      verifyStore.setEmail(email.value);
      router.push({ path: "/verify" });
    } else {
      console.error("Ошибка в ответе сервера:", response);
      emailError.value = "Ошибка отправки кода";
    }

  } catch (error) {
    console.error("Ошибка запроса:", error);
    
    if (error.response) {
      console.error("Ошибка HTTP:", error.response.status, error.response.data);
      emailError.value = `Ошибка ${error.response.status}: ${error.response.data?.message || "Попробуйте снова"}`;
    } else {
      emailError.value = "Ошибка отправки кода. Попробуйте снова.";
    }
  }
};

watchEffect(() => {
  console.log("📧 Email изменился:", email.value);
});
</script>

<style scoped>
</style> -->





<template>
  <div class="flex flex-col items-center space-y-5 p-8 xs:p-4 pt-20" v-if="loading">
    <img src="@/assets/img/daigoid.png" width="118" />
    <h1 class="text-slider leading-8 xs:leading-6 font-medium text-center">Проверка авторизации</h1>
    <p class="text-black xs:text-sm text-center text-base w-full">
      Мы отправили вам ссылку для авторизации в сообщении на номер
      <span class="font-medium">{{ dirtyIdentifier }}</span>
    </p>
    <div class="flex justify-center items-center mt-10">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary"></div>
    </div>
  </div>

  <div class="flex flex-col items-center space-y-5 p-8 pt-20" v-else>
    <img src="@/assets/img/daigoid.png" width="118" />
    <p class="text-slider leading-8 xs:leading-4 font-medium w-full text-center">
      Войти
    </p>
    <p class="w-full text-center text-base xs:text-xs">
      Если у вас нет аккаунта, он будет автоматически создан после авторизации.
    </p>

    <InputField 
      v-model="phoneNumber"
      class="xs:!text-sm"
      label="Введите номер телефона"
      type="tel"
      placeholder="+7 (___) ___-__-__"
      :error="phoneError"
    />

<Button
  variant="solid"
  class="xs:px-2 xs:text-sm"
  :disabled="!isPhoneValid || !agreePersonal"
  @click="requestCode"
>
  Войти по Daigo ID
</Button>


<!-- Чекбоксы согласий -->
<div class="flex flex-col space-y-2 w-full text-left text-xs opacity-60 w-3/4 xs:w-full">
  <label class="flex items-start space-x-2">
    <input
      type="checkbox"
      v-model="agreePersonal"
      class="mt-1 h-4 w-4 accent-white bg-primary border border-primary rounded"
    />
    <span>
      Даю согласие на
      <router-link to="/soglasie" class="text-primary underline">сбор, обработку и хранение персональных данных</router-link>
    </span>
  </label>

  <label class="flex items-start space-x-2">
    <input
      type="checkbox"
      v-model="agreeMarketing"
      class="mt-1 h-4 w-4 accent-white bg-primary border border-primary rounded"
    />
    <span>Даю согласие на <router-link to="/soglasiereklama" class="text-primary underline">получение информационных и рекламных рассылок</router-link></span>
  </label>
</div>

  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button.vue";
import InputField from "@/components/ui/InputField.vue";
import { initPushNotifications } from "@/services/push-init";

const phoneNumber = ref("");
const phoneError = ref("");
const loading = ref(false);
const dirtyIdentifier = ref("");
const agreePersonal = ref(true);
const agreeMarketing = ref(true);

const authStore = useAuthStore();
const router = useRouter();

const isPhoneValid = computed(() => /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phoneNumber.value));

const requestCode = async () => {
  phoneError.value = "";

  if (!isPhoneValid.value) {
    phoneError.value = "Введите корректный номер";
    return;
  }

  const cleanPhoneNumber = phoneNumber.value.replace(/\D/g, '');
  dirtyIdentifier.value = phoneNumber.value;
  loading.value = true;

  try {
    const response = await authStore.requestCodeBeline(cleanPhoneNumber);

    if (response?.access_token && response?.refresh_token) {
      authStore.setAuthData(response);
      initPushNotifications();
      router.push("/profile");
    } else {
      phoneError.value = "Не удалось авторизоваться. Попробуйте ещё раз.";
      loading.value = false;
    }
  } catch (error) {
    phoneError.value = "Ошибка при авторизации. Повторите попытку.";
    loading.value = false;
  }
};
</script>

