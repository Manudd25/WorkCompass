// src/store/userStore.js
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    token: null,
  }),
  actions: {
    setUser(user, token) {
      this.user = user;
      this.token = token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    loadUser() {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      if (savedToken && savedUser) {
        this.token = savedToken;
        this.user = JSON.parse(savedUser);
      }
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.clear();
    },
  },
});
