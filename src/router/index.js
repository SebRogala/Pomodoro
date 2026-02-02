import { createRouter, createWebHistory } from 'vue-router'
import Timer from '../views/Timer.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Timer
  },
  {
    path: '/timer',
    name: 'Timer',
    component: () => import('../views/Timer.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
