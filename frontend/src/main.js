import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Import Bootstrap và CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.css'

// Tạo ứng dụng Vue
const app = createApp(App)

// Sử dụng các plugin
app.use(router)
app.use(store)

// Mount ứng dụng
app.mount('#app')