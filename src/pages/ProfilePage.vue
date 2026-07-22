<template>
  <div class="flex flex-col items-center justify-center gap-4 h-full p-3 pb-32">
    <div class="relative h-11 flex flex-col items-center justify-center w-full">
      <img src="@/assets/icons/back.svg" class="absolute left-3 cursor-pointer" @click="goBack" />
      <h1 class="text-base font-medium">Мой профиль</h1>
    </div>

    <div class="w-full flex flex-col gap-4">
      <div class="w-full flex justify-center">
        <img v-if="userInfo.loyaltyStatus" :src="loyaltyCards[userInfo.loyaltyStatus]" class="w-full h-auto" />
      </div>
      
      <router-link to="/bonuses" class="bg-[#FF64E726] border border-[#FF64E7] h-[70px] px-4 py-3 rounded-lg text-sm flex flex-col gap-2 justify-between">
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-2">
            <img src="@/assets/icons/bonus.svg" class="w-5 h-5" />
            <span>Баланс бонусов:
              <span class="font-medium">
                {{ profile?.bonuses?.valid?.value ?? 0 }}
              </span>
            </span>
          </div>
          <img src="@/assets/icons/next-pink.svg" width="8" class="rotate-180 my-auto ms-auto" />
        </div>
        <span v-if="profile?.bonuses?.expiring?.value > 0" class="text-xs">💡 {{ profile?.bonuses?.expiring?.value }} бонусов сгорят {{ formatDateBonus(profile?.bonuses?.date_end) }}</span>
      </router-link>

    </div>
    <div class="flex flex-col gap-2 bg-hoverbtn w-full p-4 rounded-lg">
      <span class="text-sm">Банковские карты</span>

      <div class="flex flex-row items-center w-full">
        <div class="relative w-[60%] h-[90px]">
          <template v-if="userInfo.cards && userInfo.cards.length">
            <div 
              v-for="(card, index) in userInfo.cards" 
              :key="card.card_number"
              class="absolute transition-all duration-300 ease-in-out group"
              :style="{ zIndex: userInfo.cards.length - index, transform: `translateX(${index * 30}px)` }"
            >
              <div 
                class="w-[136px] h-[90px] bg-cover bg-center p-2 flex flex-col justify-end rounded-lg shadow-lg transition-all duration-300 ease-in-out"
                :class="index !== 0 ? 'group-hover:translate-x-4' : ''"
                style="background-image: linear-gradient(31deg, #659cff, #a6c6ff);"
              >
                <span class="text-white text-xs xs:text-[10px] mt-auto mb-1 font-medium xs:font-normal">{{ card.card_number }}</span>
                <div class="flex flex-row items-center justify-between">
                  <span class="text-white text-xs xs:text-[10px]">{{ card.expiry_date }}</span>
                  <span class="text-white text-xs xs:text-[10px]">{{ card.cvc }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- <div 
          class="w-[40%] h-[90px] bg-[#EBEBEB] rounded-lg flex flex-col gap-1 justify-center items-center cursor-pointer transition-transform duration-300 ease-in-out"
          @click="addCard"
        >
          <img src="@/assets/icons/add-card.svg" width="34" class="hover:scale-90"/>
          <span class="text-sm font-medium">Добавить</span>
        </div> -->
      </div>
    </div>

    <div v-for="[key, value] in Object.entries(userInfo).filter(([k]) => !['loyaltyStatus', 'bonusPoints', 'addresses', 'cards', 'first_name', 'last_name', 'recipient'].includes(k))"
      :key="key" class="w-full relative">
    
      <InputElement
        v-if="editField !== key"
        :modelValue="key === 'phone' ? formatPhoneNumber(value || '') : (key === 'birthDate' ? formatDate(value) : value || placeholderTexts[key])"
        class="w-full bg-hoverbtn cursor-pointer border-none h-order rounded-md text-sm"
        :class="{ '!text-gray-400': !value }"
        disabled
        @click="startEditing(key)"
      >
        <template #icon-right>
          <button @click="startEditing(key)" class="text-blue-500 absolute right-3">
            <img src="@/assets/icons/edit.svg" class="w-[16px] xs:w-[14px]" />
          </button>
        </template>
      </InputElement>

      <div v-else class="flex items-center gap-2">
        <template v-if="key === 'name'">
          <input
            v-model="editableData.first_name"
            type="text"
            class="w-1/2 bg-hoverbtn border-none h-order rounded-md text-sm p-3 xs:px-2"
            placeholder="Имя"
          />
          <input
            v-model="editableData.last_name"
            type="text"
            class="w-1/2 bg-hoverbtn border-none h-order rounded-md text-sm p-3 xs:px-2"
            placeholder="Фамилия"
          />
        </template>

        <template v-else>
          <input
            v-model="editableData[key]"
            :type="key === 'birthDate' ? 'date' : 'text'"
            class="w-full xs:w-1/2 bg-hoverbtn border-none h-order rounded-md text-sm p-3 xs:px-2"
          />
        </template>

        <button @click="updateUserData(key)" class="ml-2 xs:ml-1 text-gray-400 font-medium px-3 xs:px-2 py-1 rounded">
          Ок
        </button>
        <button @click="cancelEdit" class="ml-2 text-gray-400 px-3 py-1 rounded">
          <img src="@/assets/icons/cancel.svg" class="w-[14px] xs:w-[12px]" />
        </button>
      </div>
    </div>


    <div
      :class="[showAddresses ? 'rounded-t-md' : 'rounded-md']"
      class="w-full bg-hoverbtn cursor-pointer border-none h-order text-sm p-3 relative" 
      @click="toggleAddresses"
    >
      <span class="text-sm">Адреса</span>
      <img 
        :class="['transition-transform duration-300', showAddresses ? 'rotate-180 ' : 'rotate-270']" 
        src="@/assets/icons/back.svg" 
        width="8" 
        class="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-40"
      />
    </div>

    <div 
      v-if="showAddresses"
      class="w-full bg-hoverbtn rounded-b-md p-3 -mt-4"
    >
      <hr class="h-1">
      <div v-for="(address, index) in userInfo.addresses" :key="index" class="flex justify-between items-center bg-gray-100 p-2 rounded-lg mb-2">
        <span>{{ address.street }}</span>
        <button class="" @click.stop="removeAddress(index)">          
          <img src="@/assets/icons/cancel.svg" class="w-[14px] xs:w-[12px]" />
        </button>
      </div>
      
      <div v-if="showAddressForm" class="w-full my-2">
        <div class="relative mb-2">
          <input
            v-model="searchCityQuery"
            @input="fetchCitySuggestions"
            @focus="showCitySuggestions = true"
            @blur="() => setTimeout(() => showCitySuggestions.value = false, 150)"
            placeholder="Город"
            class="w-full py-2 px-3 border h-order border-gray-200 rounded-md text-base"
          />

          <ul
            v-if="showCitySuggestions && citySuggestions.length"
            class="absolute bg-white w-full border mt-1 rounded-md shadow z-10"
          >
            <li
              v-for="(s, i) in citySuggestions"
              :key="i"
              @mousedown="selectCitySuggestion(s)"
              class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {{ s.value }}
            </li>
          </ul>
        </div>

        <InputElement v-model="newAddress.street" class="w-full h-order bg-white border-gray-200 rounded-md text-base font-light tracking-wide my-2" placeholder="Улица, дом" />

        <div class="grid grid-cols-2 gap-3 pt-4">
          <InputElement v-model="newAddress.apartment" class="h-order bg-white border-gray-200 rounded-md text-base font-light tracking-wide" placeholder="Квартира/офис" />
          <InputElement v-model="newAddress.entrance" class="h-order bg-white border-gray-200 rounded-md text-base font-light tracking-wide" placeholder="Подъезд" />
          <InputElement v-model="newAddress.floor" class="h-order bg-white border-gray-200 rounded-md text-base font-light tracking-wide" placeholder="Этаж" />
          <InputElement v-model="newAddress.intercom" class="h-order bg-white border-gray-200 rounded-md text-base font-light tracking-wide" placeholder="Домофон" />
        </div>

        <div class="flex flex-row gap-3">
          <Button @click="showAddressForm = false" variant="solid" class="mt-2 bg-red-400 xs:text-sm xs:px-2">Отмена</Button>
          <Button @click="saveAddress" variant="solid" class="mt-2 xs:text-sm xs:px-2">Добавить</Button>
        </div>
      </div>

      <button @click="showAddressForm = true" class="text-blue-500 text-sm mt-2">Добавить адрес</button>
    </div>

    <router-link to="/orders" class="relative w-full bg-hoverbtn cursor-pointer border-none h-order rounded-md text-sm flex items-center p-3">
      История заказов
      <img src="@/assets/icons/back.svg" width="8" class="rotate-180 absolute right-3 opacity-40" />
    </router-link>

    <button @click="logout" class="border-b border-black text-xs mt-4 block text-center">
      Сменить аккаунт
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/authStore";
import { fetchUser, updateUser } from "@/services/userService";
import InputElement from "@/components/ui/InputElement.vue";
import Button from "@/components/ui/Button.vue";
import { useUserStore } from "@/store/userStore";

const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();
const profile = computed(() => userStore.profile);

const userInfo = ref({
  name: "",
  first_name: "", 
  last_name: "", 
  email: "",
  phone_number: "",
  birthDate: "",
  addresses: [],
  loyaltyStatus: "",
  bonusPoints: 0,
  recipient: "",
});

const placeholderTexts = {
  name: "Имя не указано",
  email: "Эл. почта не указана",
  phone_number: "Телефон не указан",
  birthDate: "Дата рождения не указана",
  recipient: "Получатель не указан",
};

const loyaltyCards = {
  bronze: "/img/loyalty/BronzeCard.png",
  silver: "/img/loyalty/SilverCard.png",
  gold: "/img/loyalty/GoldCard.png",
  platinum: "/img/loyalty/PlatinumCard.png",
};

const fetchUserData = async () => {
  if (!authStore.user?.id) {
    console.warn("❌ Нет ID пользователя");
    return;
  }

  try {
    const data = await fetchUser(authStore.user.id);
    if (!data) {
      console.error("❌ Ошибка загрузки пользователя");
      return;
    }

    userInfo.value = {
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Имя не указано",
      email: data.email || "",
      phone_number: data.phone_number || "",
      birthDate: data.birth_day || "",
      recipient: data.recipient || "",
      addresses: data.addresses || [],
      loyaltyStatus: data.loyalty_status || "",
      cards: data.cards || [],
    };
  } catch (error) {
    console.error("Ошибка при получении профиля:", error);
  }
};

const formatDate = (date) => {
  if (!date || date === "01-01-0001") return "Дата рождения";

  const [day, month, year] = date.split("-");
  const isoDate = `${year}-${month}-${day}`;

  const parsedDate = new Date(isoDate);
  return parsedDate.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateBonus = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const editField = ref(null);
const editableData = ref({});

const startEditing = (field) => {
  editField.value = field;
  editableData.value = {};

  if (field === "name") {
    editableData.value.first_name = userInfo.value.first_name || "";
    editableData.value.last_name = userInfo.value.last_name || "";
  } else {
    editableData.value[field] = userInfo.value[field] || "";
  }
};

const cancelEdit = () => {
  editField.value = null;
  editableData.value = {};
};

const updateUserData = async (field) => {
  let updatedData = {};

  if (field === "name") {
    updatedData.first_name = editableData.value.first_name.trim();
    updatedData.last_name = editableData.value.last_name.trim();
  } else if (field === "birthDate") {
    updatedData.birth_day = editableData.value[field].trim();
  } else {
    updatedData[field] = editableData.value[field].trim();
  }

  const response = await updateUser(authStore.user.id, updatedData);

  if (response) {
    userInfo.value = { ...userInfo.value, ...updatedData };
    cancelEdit();
  }
};

const dadataToken = "ac0fc720467713631eff0602ba19a2648c34f21d";

const showAddressForm = ref(false);
const newAddress = ref({
  city: "",
  street: "",
  apartment: "",
  entrance: "",
  floor: "",
  intercom: ""
});

const searchCityQuery = ref("");
const citySuggestions = ref([]);
const showCitySuggestions = ref(false);

const fetchCitySuggestions = async () => {
  if (searchCityQuery.value.length < 3) {
    citySuggestions.value = [];
    return;
  }

  try {
    const requestBody = {
      query: searchCityQuery.value,
      count: 5,
      from_bound: { value: "city" },
      to_bound: { value: "settlement" },
      locations: [{ country: "Россия" }],
    };

    const response = await axios.post(
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token " + dadataToken,
        },
      }
    );

    citySuggestions.value = response.data.suggestions;
  } catch (error) {
    console.error("Ошибка получения подсказок DaData:", error);
  }
};

const selectCitySuggestion = (suggestion) => {
  newAddress.value.city = suggestion.data.city || suggestion.value;
  searchCityQuery.value = newAddress.value.city;
  showCitySuggestions.value = false;
};

const saveAddress = async () => {
  if (!newAddress.value.city || !newAddress.value.street) {
    alert("Пожалуйста, укажите город и улицу");
    return;
  }

  await userStore.addAddress({ ...newAddress.value });

  newAddress.value = {
    city: "",
    street: "",
    apartment: "",
    entrance: "",
    floor: "",
    intercom: ""
  };
  searchCityQuery.value = "";
  citySuggestions.value = [];
  showAddressForm.value = false;
};

const removeAddress = async (index) => {
  if (confirm("Удалить этот адрес?")) {
    await userStore.removeAddress(index);
  }
};

const showAddresses = ref(false);

const toggleAddresses = () => {
  showAddresses.value = !showAddresses.value;
};

const formatPhoneNumber = (number) => {
  if (!number) return "Телефон не указан";
  
  number = number.replace(/\D/g, "");

  if (number.startsWith("8")) {
    number = "7" + number.slice(1);
  } else if (!number.startsWith("7")) {
    number = "7" + number;
  }

  let formatted = "+7 ";
  if (number.length > 1) formatted += `(${number.slice(1, 4)}) `;
  if (number.length > 4) formatted += `${number.slice(4, 7)}-`;
  if (number.length > 7) formatted += `${number.slice(7, 9)}-`;
  if (number.length > 9) formatted += number.slice(9, 11);

  return formatted.trim();
};


const goBack = () => {
  router.go(-1);
};

const logout = () => {
  authStore.logout();
  router.push("/authenticate");
};

onMounted(fetchUserData);

</script>

<style scoped>
input:focus {
  outline: none;
  border: 1px solid #6BA0FF;
}
</style>

