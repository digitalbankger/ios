<template>
  <div class="flex flex-col items-center space-y-5 p-8 xs:p-4 pt-20">
    <img src="@/assets/img/daigoid.png" width="118" alt="Daigo ID" />

    <p class="text-slider leading-8 xs:leading-6 font-medium w-full text-center">
      Войти
    </p>
    <p class="w-full text-center text-base xs:text-xs">
      Если аккаунта ещё нет, он будет создан автоматически после подтверждения номера.
    </p>

    <InputField
      v-model="phoneNumber"
      class="xs:!text-sm"
      label="Введите номер телефона"
      type="tel"
      inputmode="tel"
      autocomplete="tel"
      placeholder="+7 (___) ___-__-__"
      :disabled="authStore.isSendingCode"
      :error="phoneError"
    />

    <Button
      variant="solid"
      class="xs:px-2 xs:text-sm"
      :disabled="!isPhoneValid || !agreePersonal || authStore.isSendingCode"
      @click="requestCode"
    >
      {{ authStore.isSendingCode ? "Отправляем код…" : "Войти по Daigo ID" }}
    </Button>

    <div class="flex flex-col space-y-2 w-full text-left text-xs opacity-60 xs:w-full">
      <label class="flex items-start space-x-2">
        <input
          v-model="agreePersonal"
          type="checkbox"
          class="mt-1 h-4 w-4 accent-white bg-primary border border-primary rounded"
        />
        <span>
          Даю согласие на
          <router-link to="/soglasie" class="text-primary underline">
            сбор, обработку и хранение персональных данных
          </router-link>
        </span>
      </label>

      <label class="flex items-start space-x-2">
        <input
          v-model="agreeMarketing"
          type="checkbox"
          class="mt-1 h-4 w-4 accent-white bg-primary border border-primary rounded"
        />
        <span>
          Даю согласие на
          <router-link to="/soglasiereklama" class="text-primary underline">
            получение информационных и рекламных рассылок
          </router-link>
        </span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/authStore";
import { useVerifyStore } from "@/store/verifyStore";
import Button from "@/components/ui/Button.vue";
import InputField from "@/components/ui/InputField.vue";

const phoneNumber = ref("");
const phoneError = ref("");
const agreePersonal = ref(true);
const agreeMarketing = ref(true);

const authStore = useAuthStore();
const verifyStore = useVerifyStore();
const router = useRouter();

const isPhoneValid = computed(() => /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phoneNumber.value));

async function requestCode() {
  phoneError.value = "";

  if (!isPhoneValid.value) {
    phoneError.value = "Введите номер телефона полностью";
    return;
  }

  const cleanPhone = phoneNumber.value.replace(/\D/g, "");
  const result = await authStore.requestCode(cleanPhone);

  if (!result.success) {
    phoneError.value = result.message || "Не удалось отправить код. Попробуйте ещё раз.";
    return;
  }

  verifyStore.setPhone(cleanPhone, phoneNumber.value);
  await router.push("/verify");
}
</script>
