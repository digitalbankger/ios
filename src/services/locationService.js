// export const getUserCoordinates = () => {
//   return new Promise((resolve, reject) => {
//     if (!navigator.geolocation) {
//       return reject(new Error("Геолокация не поддерживается"));
//     }

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         resolve({
//           lat: position.coords.latitude,
//           lon: position.coords.longitude,
//         });
//       },
//       (error) => reject(error),
//       { timeout: 10000 }
//     );
//   });
// };

// export const getCityByCoords = async ({ lat, lon }) => {
//   const response = await fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`);
//   const data = await response.json();

//   return data?.address?.city || data?.address?.town || data?.address?.village || "Москва";
// };
