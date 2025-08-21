import deliveryZones from "@/assets/data/deliveryZones.json";

export const getDistrictByCity = (city) => {
  const map = {
    "Москва": "Центральный",
    "Санкт-Петербург": "Северо-Западный",
    "Ростов-на-Дону": "Южный",
    "Махачкала": "Северо-Кавказский",
    "Казань": "Приволжский",
    "Екатеринбург": "Уральский",
    "Новосибирск": "Сибирский",
    "Владивосток": "Дальневосточный",
    "Нижний Новгород": "Приволжский",
    "Красноярск": "Сибирский"
  };

  return map[city] || "Центральный";
};

export const getDeliveryRangeByDistrict = (district) => {
  return deliveryZones[district] || "4–6 дней";
};
