import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./index.css";
import { initTheme } from "./composables/useTheme.js";

// One global theme — apply before mount so light/dark is never mixed.
initTheme();

const pinia = createPinia();
createApp(App).use(pinia).use(router).mount("#app");
