import { createRouter, createWebHistory } from 'vue-router'
import createGuard from './guard'

const HomeView = () => import(/* webpackChunkName: "Home" */ '@/views/Home/index.vue')
const HomeChatView = () => import(/* webpackChunkName: "Home" */ '@/views/Home/Chat/index.vue')
const HomeContactsView = () =>
  import(/* webpackChunkName: "Home" */ '@/views/Home/Contacts/index.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      children: [
        {
          path: '',
          name: 'chat',
          component: HomeChatView,
        },
        {
          path: 'contact',
          name: 'contact',
          component: HomeContactsView,
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

createGuard(router)

export default router
