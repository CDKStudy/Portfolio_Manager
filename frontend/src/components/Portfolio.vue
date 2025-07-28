<template>
  <div class="portfolio-app">
    <!-- Sidebar Navigation -->
    <nav class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <i class="icon">📊</i>
          <span>Portfolio Manager</span>
        </div>
      </div>
      
      <ul class="nav-menu">
        <li class="nav-item active">
          <a href="#" class="nav-link">
            <i class="nav-icon">🏠</i>
            <span>Dashboard</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <i class="nav-icon">📈</i>
            <span>STOCK</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <i class="nav-icon">🏛️</i>
            <span>BOND</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <i class="nav-icon">💰</i>
            <span>CASH</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <i class="nav-icon">📊</i>
            <span>Analytics</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <i class="nav-icon">📄</i>
            <span>Transactions</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <i class="nav-icon">📋</i>
            <span>Reports</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <i class="nav-icon">⚙️</i>
            <span>Settings</span>
          </a>
        </li>
      </ul>
      
      <div class="user-profile-sidebar">
        <div class="user-avatar">
          <span>JD</span>
        </div>
        <div class="user-info">
          <div class="user-name">John Doe</div>
          <div class="user-email">john.doe@example.com</div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="main-header">
        <div class="header-left">
          <h1>Dashboard</h1>
        </div>
        <div class="header-right">
          <span class="last-updated">Last updated: 7/28/2025</span>
        </div>
      </header>

      <!-- Portfolio Summary Cards -->
      <section class="portfolio-summary">
        <div class="summary-card total-portfolio">
          <div class="card-header">
            <span class="card-title">Total Portfolio Value</span>
            <i class="card-icon">💰</i>
          </div>
          <div class="card-content">
            <div class="card-value">${{ formatCurrency(portfolio.totalValue || 45231.89) }}</div>
            <div class="card-change positive">
              <span class="change-icon">📈</span>
              <span>+2.5% from last month</span>
            </div>
          </div>
        </div>

        <div class="summary-card stocks">
          <div class="card-header">
            <span class="card-title">Stocks</span>
            <i class="card-icon">📊</i>
          </div>
          <div class="card-content">
            <div class="card-value">$28,459.00</div>
            <div class="card-change positive">
              <span class="change-icon">📈</span>
              <span>+4.3% from last month</span>
            </div>
          </div>
        </div>

        <div class="summary-card bonds">
          <div class="card-header">
            <span class="card-title">Bonds</span>
            <i class="card-icon">📊</i>
          </div>
          <div class="card-content">
            <div class="card-value">$12,500.00</div>
            <div class="card-change negative">
              <span class="change-icon">📉</span>
              <span>-0.8% from last month</span>
            </div>
          </div>
        </div>

        <div class="summary-card cash">
          <div class="card-header">
            <span class="card-title">Cash</span>
            <i class="card-icon">💰</i>
          </div>
          <div class="card-content">
            <div class="card-value">$4,272.89</div>
            <div class="card-change neutral">
              <span>+0.1% interest rate</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Tab Navigation -->
      <section class="tab-navigation">
        <button class="tab-btn" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
          Portfolio Overview
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'performance' }" @click="activeTab = 'performance'">
          Performance
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'allocation' }" @click="activeTab = 'allocation'">
          Asset Allocation
        </button>
      </section>

      <!-- Tab Content -->
      <section class="tab-content">
        <!-- Portfolio Overview Tab -->
        <div v-if="activeTab === 'overview'" class="tab-panel">
          <div class="content-grid">
            <!-- Portfolio Performance Chart -->
            <div class="chart-card performance-chart">
              <h3>Portfolio Performance</h3>
              <div class="chart-container">
                <Line 
                  :data="chartData" 
                  :options="chartOptions"
                />
              </div>
            </div>

            <!-- Holdings List -->
            <div class="holdings-card">
              <div class="holdings-header">
                <h3>Your Holdings</h3>
                <button @click="showBuyModal = true" class="btn btn-primary">
                  + Add Stock
                </button>
              </div>
              
              <div v-if="loading && portfolio.items.length === 0" class="loading-state">
                <div class="spinner"></div>
                <p>Loading portfolio...</p>
              </div>
              <div v-else-if="portfolio.items.length === 0" class="empty-state">
                <div class="empty-icon">📈</div>
                <p>No stocks in your portfolio yet</p>
                <p class="empty-subtitle">Start by adding your first stock!</p>
              </div>
              <div v-else class="holdings-list">
                <div
                  v-for="item in portfolio.items"
                  :key="item.id"
                  class="holding-item"
                >
                  <div class="holding-info">
                    <div class="stock-symbol">{{ item.stockTicker }}</div>
                    <div class="stock-name">{{ item.volume }} shares</div>
                  </div>
                  <div class="holding-values">
                    <div class="current-value">${{ formatCurrency(item.currentPrice || 0) }}</div>
                    <div class="profit-loss" :class="{ positive: (item.profitLoss || 0) >= 0, negative: (item.profitLoss || 0) < 0 }">
                      {{ (item.profitLoss || 0) >= 0 ? '+' : '' }}${{ formatCurrency(item.profitLoss || 0) }}
                    </div>
                  </div>
                  <div class="holding-actions">
                    <button @click="sellStock(item)" class="btn btn-sm btn-outline">Sell</button>
                    <button @click="deleteItem(item.id)" class="btn btn-sm btn-danger">×</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Market Watch -->
            <div class="market-watch-card">
              <h3>Market Watch</h3>
              <div class="market-list">
                <div 
                  v-for="stock in marketStocks.slice(0, 6)" 
                  :key="stock.ticker"
                  class="market-item"
                  @click="selectStock(stock.ticker)"
                >
                  <div class="market-symbol">{{ stock.ticker }}</div>
                  <div class="market-price">${{ formatCurrency(stock.price) }}</div>
                  <div class="market-change" :class="{ positive: stock.change >= 0, negative: stock.change < 0 }">
                    {{ stock.change >= 0 ? '+' : '' }}{{ formatPercent(stock.changePercent) }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Tab -->
        <div v-if="activeTab === 'performance'" class="tab-panel">
          <div class="performance-content">
            <div class="chart-card full-width">
              <h3>Portfolio Performance Over Time</h3>
              <div class="chart-container large">
                <Line 
                  :data="chartData" 
                  :options="performanceChartOptions"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Asset Allocation Tab -->
        <div v-if="activeTab === 'allocation'" class="tab-panel">
          <div class="allocation-content">
            <h3>Asset Allocation</h3>
            <p class="allocation-subtitle">Current distribution of your portfolio</p>
            <div class="pie-chart-placeholder">
              <p>PieChart Component</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Modals (Buy/Sell) -->
    <div v-if="showBuyModal" class="modal-overlay" @click="showBuyModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Buy Stock</h3>
          <button @click="showBuyModal = false" class="close-btn">×</button>
        </div>
        <form @submit.prevent="buyStock" class="modal-form">
          <div class="form-group">
            <label>Stock Symbol</label>
            <input
              v-model="buyForm.stockTicker"
              type="text"
              placeholder="e.g., AAPL"
              required
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Number of Shares</label>
            <input
              v-model.number="buyForm.volume"
              type="number"
              min="1"
              required
              placeholder="Enter quantity"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Price per Share (optional)</label>
            <input
              v-model.number="buyForm.buyPrice"
              type="number"
              step="0.01"
              placeholder="Leave empty for market price"
              class="form-input"
            />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showBuyModal = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="loading" class="btn btn-primary">
              {{ loading ? 'Buying...' : 'Buy Stock' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-toast">
      <span>{{ error }}</span>
      <button @click="error = ''" class="close-btn">×</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../services/api';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default {
  name: 'Portfolio',
  components: {
    Line
  },
  setup() {
    const portfolio = ref({
      totalItems: 0,
      totalValue: 45231.89,
      totalCost: 0,
      totalProfitLoss: 0,
      totalProfitLossPercent: 0,
      items: []
    });
    const loading = ref(false);
    const error = ref('');
    const activeTab = ref('overview');
    const searchQuery = ref('');
    const searchResults = ref([]);
    const marketStocks = ref([
      { ticker: 'AAPL', price: 213.88, change: 1.28, changePercent: 0.06 },
      { ticker: 'MSFT', price: 513.71, change: 2.82, changePercent: 0.55 },
      { ticker: 'GOOGL', price: 193.18, change: 1.02, changePercent: 0.53 },
      { ticker: 'AMZN', price: 231.44, change: -0.79, changePercent: -0.34 },
      { ticker: 'TSLA', price: 316.06, change: 11.11, changePercent: 3.52 },
      { ticker: 'META', price: 712.68, change: -2.14, changePercent: -0.30 }
    ]);
    const recentTransactions = ref([]);
    const showBuyModal = ref(false);
    const showSellModal = ref(false);
    const sellingItem = ref(null);
    
    const buyForm = ref({
      stockTicker: '',
      volume: 1,
      buyPrice: null
    });
    
    const sellForm = ref({
      volume: 1,
      sellPrice: null
    });

    // 图表数据
    const chartData = ref({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Portfolio Value',
          data: [40000, 41200, 43500, 42800, 44500, 46200, 45800, 47500, 48200, 47800, 49500, 45231.89],
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    });

    const chartOptions = ref({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#6366f1',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return `Portfolio Value: $${context.parsed.y.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#6b7280',
            font: {
              size: 12
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(107, 114, 128, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: '#6b7280',
            font: {
              size: 12
            },
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    });

    const performanceChartOptions = ref({
      ...chartOptions.value,
      maintainAspectRatio: false,
      aspectRatio: 3
    });

    // API functions (simplified for demo)
    const loadPortfolio = async () => {
      loading.value = true;
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Use default values for demo
      } catch (err) {
        error.value = 'Failed to load portfolio';
      } finally {
        loading.value = false;
      }
    };

    const selectStock = (ticker) => {
      buyForm.value.stockTicker = ticker;
      showBuyModal.value = true;
    };

    const buyStock = async () => {
      if (!buyForm.value.stockTicker || !buyForm.value.volume) {
        error.value = 'Please fill in all required fields';
        return;
      }

      loading.value = true;
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        buyForm.value = {
          stockTicker: '',
          volume: 1,
          buyPrice: null
        };
        showBuyModal.value = false;
        
        // Show success message
        error.value = '';
      } catch (err) {
        error.value = 'Failed to buy stock';
      } finally {
        loading.value = false;
      }
    };

    const sellStock = (item) => {
      // Implement sell functionality
    };

    const deleteItem = (id) => {
      // Implement delete functionality
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    };

    const formatPercent = (value) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    };

    onMounted(() => {
      loadPortfolio();
    });

    return {
      portfolio,
      loading,
      error,
      activeTab,
      searchQuery,
      searchResults,
      marketStocks,
      recentTransactions,
      showBuyModal,
      showSellModal,
      sellingItem,
      buyForm,
      sellForm,
      chartData,
      chartOptions,
      performanceChartOptions,
      selectStock,
      buyStock,
      sellStock,
      deleteItem,
      formatCurrency,
      formatPercent
    };
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.portfolio-app {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: white;
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-header {
  padding: 0 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
}

.logo .icon {
  font-size: 24px;
}

.nav-menu {
  flex: 1;
  list-style: none;
  padding: 24px 0;
}

.nav-item {
  margin: 4px 16px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.nav-item.active .nav-link,
.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.user-profile-sidebar {
  padding: 0 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #6366f1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 2px;
}

.user-email {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 32px;
  max-width: calc(100vw - 280px);
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.main-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
}

.last-updated {
  color: #6b7280;
  font-size: 14px;
}

/* Portfolio Summary Cards */
.portfolio-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.summary-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.card-icon {
  font-size: 20px;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.card-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
}

.card-change.positive {
  color: #10b981;
}

.card-change.negative {
  color: #ef4444;
}

.card-change.neutral {
  color: #6b7280;
}

.change-icon {
  font-size: 12px;
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: none;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab-btn.active {
  color: #1f2937;
  border-bottom-color: #6366f1;
}

.tab-btn:hover {
  color: #374151;
}

/* Tab Content */
.tab-content {
  margin-top: 32px;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

/* Chart Card */
.chart-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  grid-row: span 2;
}

.chart-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
}

.chart-container {
  height: 300px;
  position: relative;
}

.chart-container.large {
  height: 400px;
}

.full-width {
  grid-column: 1 / -1;
}

/* Holdings Card */
.holdings-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  height: fit-content;
}

.holdings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.holdings-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.holdings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.holding-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
}

.holding-info {
  flex: 1;
}

.stock-symbol {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
}

.stock-name {
  color: #6b7280;
  font-size: 14px;
  margin-top: 2px;
}

.holding-values {
  text-align: right;
  margin-right: 16px;
}

.current-value {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
}

.profit-loss {
  font-size: 14px;
  font-weight: 500;
  margin-top: 2px;
}

.profit-loss.positive {
  color: #10b981;
}

.profit-loss.negative {
  color: #ef4444;
}

.holding-actions {
  display: flex;
  gap: 8px;
}

/* Market Watch Card */
.market-watch-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  height: fit-content;
}

.market-watch-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

.market-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.market-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.market-item:hover {
  background: #f3f4f6;
}

.market-symbol {
  font-weight: 600;
  color: #1f2937;
}

.market-price {
  font-weight: 500;
  color: #1f2937;
}

.market-change {
  font-size: 14px;
  font-weight: 500;
}

.market-change.positive {
  color: #10b981;
}

.market-change.negative {
  color: #ef4444;
}

/* Loading and Empty States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: #6b7280;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-subtitle {
  font-size: 14px;
  margin-top: 8px;
}

/* Buttons */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5856eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-outline {
  background: transparent;
  color: #6366f1;
  border: 1px solid #6366f1;
}

.btn-outline:hover:not(:disabled) {
  background: #6366f1;
  color: white;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  margin-bottom: 24px;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
}

.modal-form {
  padding: 0 24px 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 500;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

/* Error Toast */
.error-toast {
  position: fixed;
  top: 24px;
  right: 24px;
  background: #fef2f2;
  color: #dc2626;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 400px;
}

/* Performance Tab */
.performance-content {
  max-width: 100%;
}

/* Allocation Tab */
.allocation-content {
  text-align: center;
  padding: 40px;
}

.allocation-subtitle {
  color: #6b7280;
  margin-bottom: 40px;
}

.pie-chart-placeholder {
  background: white;
  border-radius: 16px;
  padding: 80px;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 18px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-card {
    grid-row: span 1;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 240px;
  }
  
  .main-content {
    margin-left: 240px;
    max-width: calc(100vw - 240px);
    padding: 20px;
  }
  
  .portfolio-summary {
    grid-template-columns: 1fr;
  }
  
  .modal {
    width: 95%;
  }
}

@media (max-width: 640px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .main-content {
    margin-left: 0;
    max-width: 100vw;
  }
  
  .main-header h1 {
    font-size: 24px;
  }
  
  .card-value {
    font-size: 24px;
  }
}
</style> 