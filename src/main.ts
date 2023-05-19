import { createApp } from 'vue'
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import '@/utils/websocket'
import './styles/main.css'
import vLogin from './directives/v-login'

const app = createApp(App)

// app.use(ElementPlus)
app.use(createPinia())
app.use(router)

// 没登录就要求先登录的指令。
app.directive('login', vLogin)

app.mount('#app')
