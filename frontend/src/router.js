import { createRouter, createWebHistory } from 'vue-router'
import Portfolio from './components/Portfolio.vue'

const routes = [
  {
    path: '/',
    name: 'Portfolio',
    component: Portfolio
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 