import { createApp } from 'vue'
import { createPinia } from 'pinia'
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import vLogin from './directives/v-login'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import App from './App.vue'
import 'dayjs/locale/zh-cn'

import './styles/main.css'
import '@/utils/websocket'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'

dayjs.locale('zh-cn') // 设置 dayjs 语言
dayjs.extend(weekday) // 设置一周起始位周一

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate) // 数据持久化

const app = createApp(App)
app.use(pinia)
app.use(router)
app.directive('login', vLogin) // 登录权限指令-未登录先登录
app.mount('#app')
