<template>
  <div class="flex flex-col w-full gap-5 px-1 mb-2">
    <h3 class="text-xl font-medium">Способы оплаты</h3>
    <IconText icon="/icons/ship-pay/sbp.svg" text="СПБ" />
    <IconText icon="/icons/ship-pay/dolyami.svg" text="Долями: заказы до 30 000 ₽" />
    <IconText icon="/icons/ship-pay/tbank.svg" text="Т-рассрочка: на заказы от 30 000 ₽" />
    <IconText icon="/icons/ship-pay/card.svg" text="Банковской картой онлайн" />
    <IconText icon="/icons/ship-pay/card.svg" text="Банковской картой курьеру" />
    <IconText icon="/icons/ship-pay/cash.svg" text="Наличными курьеру" />

    <h3 class="text-xl font-medium mt-4">
      Бесплатная доставка в г. {{ city }}
    </h3>
    <template v-if="props.deliveryInfo">
      <IconText
        v-for="(time, method) in props.deliveryInfo"
        :key="method"
        :icon="getIcon(method)"
        :text="`${method} — ${time}`"
      />
    </template>
    <p v-else class="text-sm text-gray-500">Загрузка информации о доставке...</p>
    <p v-if="city === 'Москва'" class="text-sm xs:text-xs">Адрес самовывоза: г. Москва, Большой Сухаревский переулок, дом. 21, стр. 2</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import IconText from "@/components/ui/IconText.vue";
import { getDistrictByCity } from "@/services/districtService";
import { getDeliveryTimes } from "@/services/deliveryService";

const props = defineProps({
  city: String,
  deliveryInfo: Object,
});

const deliveryInfo = ref(null);

onMounted(async () => {
  const savedCity = localStorage.getItem("user_city");

  if (savedCity) {
    city.value = savedCity;
  } else {
    try {
      const coords = await getUserCoordinates();
      city.value = await getCityByCoords(coords);
      localStorage.setItem("user_city", city.value);
    } catch {
      city.value = "Москва";
    }
  }

  district.value = getDistrictByCity(city.value);
  deliveryInfo.value = getDeliveryTimes(district.value);
});

const getIcon = (method) => {
  if (method.includes("Дайго")) return "/icons/ship-pay/daigo-courier.svg";
  if (method.includes("до двери")) return "/icons/ship-pay/major-courier.svg";
  if (method.includes("ПВЗ СДЭК")) return "/icons/ship-pay/cdek.svg";
  return "/icons/ship-pay/default.svg";
};
</script>

<style scoped>
h3 {
  margin-top: 0.5rem;
}
</style>
