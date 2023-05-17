import { createRouter, createWebHistory } from 'vue-router'
const HomeView = () => import(/* webpackChunkName: "Home" */ '@/views/Home/index.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
