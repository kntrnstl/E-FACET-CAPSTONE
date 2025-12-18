import { createApp } from 'vue'
import App from './App.vue'
import 'normalize.css'  // Add this line
import router from './router'
import './style.css'

const app = createApp(App)
app.use(router)
app.mount('#app')