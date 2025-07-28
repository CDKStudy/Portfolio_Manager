import { createRouter, createWebHistory } from 'vue-router'
import Layout from './components/Layout.vue'
import Dashboard from './components/Dashboard.vue'
import Stock from './components/Stock.vue'
import Bond from './components/Bond.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard
      },
      {
        path: '/stock',
        name: 'stock',
        component: Stock
      },
      {
        path: '/bond',
        name: 'bond',
        component: Bond
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 