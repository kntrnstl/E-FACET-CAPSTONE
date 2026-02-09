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

// Import ALL the icons your component uses
import {
  faUser,
  faHome,
  faBars,
  faChartLine,
  faSignInAlt,
  faUserPlus,
  faGraduationCap,
  faCar,
  faStar,
  faCogs,
  faQuestionCircle,
  faCloudUploadAlt,
  faCertificate,
  faFileAlt,
  faCalendarCheck,
  faFileSignature,
  faCheckCircle,
  faFileUpload,
  faCalendarAlt,
  faChartBar,
  faClipboardCheck,
  faUpload,
  faAward,
  faPhoneAlt,
  faList,
  faInfoCircle,
  faBriefcase,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faClock,
  faFile,
  faCalendar,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

// Import brand icons
import {
  faFacebookF,
  faTwitter,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

// Register ALL icons
library.add(
  // Solid icons
  faUser,
  faHome,
  faBars,
  faChartLine,
  faSignInAlt,
  faUserPlus,
  faGraduationCap,
  faCar,
  faStar,
  faCogs,
  faQuestionCircle,
  faCloudUploadAlt,
  faCertificate,
  faFileAlt,
  faCalendarCheck,
  faFileSignature,
  faCheckCircle,
  faFileUpload,
  faCalendarAlt,
  faChartBar,
  faClipboardCheck,
  faUpload,
  faAward,
  faPhoneAlt,
  faList,
  faInfoCircle,
  faBriefcase,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faClock,
  faFile,
  faCalendar,
  faArrowRight,

  // Brand icons
  faFacebookF,
  faTwitter,
  faInstagram,
  faYoutube,
);

const app = createApp(App);

// Register Font Awesome component globally
app.component("font-awesome-icon", FontAwesomeIcon);

app.use(router);
app.mount("#app");
