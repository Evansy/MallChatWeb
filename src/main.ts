import { createApp } from 'vue'
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import '@/utils/websocket'

import './styles/main.css'

const app = createApp(App)

// app.use(ElementPlus)
app.use(createPinia())
app.use(router)

app.mount('#app')
