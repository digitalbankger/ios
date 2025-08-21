import { defineStore } from "pinia";

export const useVerifyStore = defineStore("verify", {
  state: () => ({
    phone: "",
    dirtyPhone: "",
    email: ""
  }),
  actions: {
    setPhone(phone, dirtyPhone) {
      this.phone = phone;
      this.dirtyPhone = dirtyPhone;
    },
    setEmail(email) {
      this.email = email;
    },
    clear() {
      this.phone = "";
      this.dirtyPhone = "";
      this.email = "";
    }
  }
});
