import { createApp } from "vue";
import App from "./App.vue";
import "normalize.css";
import router from "./router";
import "./style.css";

import axios from "axios"; // ✅ ADD THIS
axios.defaults.withCredentials = true; // ✅ ADD THIS

const app = createApp(App);
app.use(router);
app.mount("#app");
