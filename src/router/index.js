import { createRouter, createWebHistory } from 'vue-router'
import Timer from '../views/Timer.vue'

const routes = [
  {
    path: '/',
    name: 'Timer',
    component: Timer
  },
  {
    path: '/sequences',
    name: 'Sequences',
    component: () => import('../views/SequenceTimer.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
