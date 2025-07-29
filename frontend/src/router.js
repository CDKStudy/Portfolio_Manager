import { createRouter, createWebHistory } from 'vue-router'
import Layout from './components/Layout.vue'
import Dashboard from './components/Dashboard.vue'
import Stock from './components/Stock.vue'
import Fund from './components/Fund.vue'
import AIAgent from './components/AIAgent.vue'
import Cash from './components/Cash.vue'
import Transaction from './components/Transaction.vue'

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
        path: '/fund',
        name: 'fund',
        component: Fund
      },
      {
        path: '/ai-agent',
        name: 'ai-agent',
        component: AIAgent
      },
      {
        path: '/cash',
        name: 'cash',
        component: Cash
      },
      {
        path: '/transactions',
        name: 'transactions',
        component: Transaction
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 