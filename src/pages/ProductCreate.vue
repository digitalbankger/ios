<template>
  <div class="container mx-auto p-6 !pb-[180px]">
    <h1 class="text-xl font-bold mb-4">Добавление товара</h1>

    <form @submit.prevent="submitProduct" class="space-y-4">
      <input v-model="product.product_name" placeholder="Название товара" required class="input" />
      <input v-model="product.url_cpu" placeholder="URL товара (slug)" required class="input" />
      <input v-model.number="product.price" type="number" placeholder="Цена" required class="input" />
      
      <textarea v-model="product.description" placeholder="Описание (поддерживает перенос строк)" required class="textarea"></textarea>
      <textarea v-model="product.composition" placeholder="Состав" class="textarea"></textarea>
      <textarea v-model="product.usage_instruction" placeholder="Инструкция по применению" class="textarea"></textarea>
      <textarea v-model="product.action_principle" placeholder="Принцип действия" class="textarea"></textarea>
      <textarea v-model="product.metabolites" placeholder="Метаболиты" class="textarea"></textarea>
      <textarea v-model="product.effectiveness" placeholder="Эффективность" class="textarea"></textarea>
      <input v-model.number="product.order_count" type="number" placeholder="Количество заказов" required class="input" />

      <!-- ✅ Drag & Drop Загрузка изображений -->
      <div 
        class="dropzone" 
        @dragover.prevent="dragOver" 
        @dragleave="dragLeave" 
        @drop="handleDrop"
        :class="{ 'dropzone-active': isDragging }"
        @click="openFilePicker"
      >
        <p v-if="!images.length">Перетащите сюда файлы или нажмите, чтобы выбрать</p>
        <div class="flex flex-wrap gap-2">
          <img v-for="image in imagesPreview" :key="image" :src="image" class="w-24 h-24 object-cover rounded-md" />
        </div>
      </div>

      <input type="file" multiple ref="fileInput" @change="handleFileUpload" class="hidden">

      <button type="submit" class="btn-primary">Добавить товар</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const product = ref({
  product_name: "",
  url_cpu: "",
  price: null,
  description: "",
  composition: "",
  usage_instruction: "",
  action_principle: "",
  metabolites: "",
  effectiveness: "",
  order_count: 0
});

const images = ref([]);
const imagesPreview = ref([]);
const isDragging = ref(false);
const fileInput = ref(null);

// Открытие диалогового окна выбора файлов
const openFilePicker = () => {
  fileInput.value.click();
};

// Обработка файлов после выбора через input
const handleFileUpload = (event) => {
  const files = event.target.files;
  addFiles(files);
};

// Обработка перетаскивания файлов (Drag & Drop)
const handleDrop = (event) => {
  event.preventDefault();
  isDragging.value = false;
  const files = event.dataTransfer.files;
  addFiles(files);
};

const dragOver = () => {
  isDragging.value = true;
};

const dragLeave = () => {
  isDragging.value = false;
};

// ✅ Фильтруем только файлы (изображения)
const addFiles = (files) => {
  const fileList = Array.from(files);

  fileList.forEach((file) => {
    if (file instanceof File && file.type.startsWith("image/")) {
      images.value.push(file);
      imagesPreview.value.push(URL.createObjectURL(file));
    } else {
      alert("Загружайте только изображения!");
    }
  });

  console.log("📌 Файлы добавлены:", images.value);
};

// ✅ Отправка товара и изображений
const submitProduct = async () => {
  try {
    const formData = new FormData();

    Object.entries(product.value).forEach(([key, value]) => {
      formData.append(key, value);
    });

    images.value.forEach((image) => {
      formData.append("images", image);
    });

    console.log("📌 Отправляемые данные:", formData);
    console.log("📌 Отправляемые файлы:", formData.getAll("images"));

    const response = await fetch("https://api.daigo.ru/api/products/create", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка при добавлении товара: ${errorText}`);
    }

    alert("Товар успешно добавлен!");
  } catch (error) {
    alert(`Ошибка при добавлении товара: ${error.message}`);
  }
};
</script>

<style scoped>
.input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 100px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #0056b3;
}

/* ✅ Стили для Drag & Drop */
.dropzone {
  width: 100%;
  padding: 20px;
  border: 2px dashed #ccc;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropzone-active {
  border-color: #007bff;
  background-color: rgba(0, 123, 255, 0.1);
}

.hidden {
  display: none;
}
</style>
