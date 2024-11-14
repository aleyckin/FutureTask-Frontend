import { createApp } from 'vue'
import App from './App.vue'
import router from "./routes.js"
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

createApp(App).use(router, Toast).mount('#app')