import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/route/:code',
      name: 'route',
      component: () => import('@/pages/RouteResult.vue'),
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('@/pages/FloorMap.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/pages/About.vue'),
    },
  ],
})

export default router
