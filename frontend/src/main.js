import { createApp } from "vue";
import App from "./App.vue";
import "normalize.css";
import router from "./router";
import "./style.css";

import axios from "axios";
axios.defaults.withCredentials = true;

// ✅ Font Awesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// solid icons (add more as needed)
import {
  faUser,
  faHome,
  faBars,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

// register icons
library.add(faUser, faHome, faBars, faChartLine);

const app = createApp(App);

// register Font Awesome component globally
app.component("font-awesome-icon", FontAwesomeIcon);

app.use(router);
app.mount("#app");
