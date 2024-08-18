import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import { autoAnimatePlugin } from "@formkit/auto-animate/vue";

createApp(App).use(autoAnimatePlugin).mount("#app");
