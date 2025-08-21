import deliveryTimes from "@/assets/data/deliveryTimes.json";

export const getDeliveryTimes = (district) => {
  return deliveryTimes[district] || deliveryTimes["Центральный (без Москвы)"];
};
