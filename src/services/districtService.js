import districtMap from "@/assets/data/federalDistricts.json";

export const getDistrictByCity = (cityName) => {
  return districtMap[cityName] || "Центральный (без Москвы)";
};
