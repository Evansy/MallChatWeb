import { createApp } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import weekday from 'dayjs/plugin/weekday'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
// import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import '@/utils/websocket'
import './styles/main.css'
import vLogin from './directives/v-login'

// 设置 dayjs 语言
dayjs.locale('zh-cn')
// 设置一周起始位周一
dayjs.extend(weekday)

const app = createApp(App)

// app.use(ElementPlus)
app.use(createPinia())
app.use(router)

// 没登录就要求先登录的指令。
app.directive('login', vLogin)

app.mount('#app')
