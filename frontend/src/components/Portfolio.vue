<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1>Portfolio Dashboard</h1>
      </div>
      <div class="header-center">
        <div class="search-container">
          <input 
            v-model="searchQuery" 
            @input="searchStocks"
            type="text" 
            placeholder="Search for stocks..." 
            class="search-input"
          />
          <div v-if="searchResults.length > 0" class="search-results">
            <div 
              v-for="result in searchResults" 
              :key="result"
              @click="selectStock(result)"
              class="search-result-item"
            >
              {{ result }}
            </div>
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="user-profile">
          <span class="username">Trader</span>
          <div class="profile-avatar">👤</div>
        </div>
      </div>
    </header>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card balance-card">
        <div class="card-icon">💰</div>
        <div class="card-content">
          <h3>Total Value</h3>
          <p class="card-value">${{ formatCurrency(portfolio.totalValue || 0) }}</p>
          <span class="card-change" :class="{ positive: portfolio.totalProfitLoss >= 0, negative: portfolio.totalProfitLoss < 0 }">
            {{ portfolio.totalProfitLoss >= 0 ? '+' : '' }}${{ formatCurrency(portfolio.totalProfitLoss || 0) }}
          </span>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="card-icon">📈</div>
        <div class="card-content">
          <h3>Total Cost</h3>
          <p class="card-value">${{ formatCurrency(portfolio.totalCost || 0) }}</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="card-icon">📊</div>
        <div class="card-content">
          <h3>Portfolio Items</h3>
          <p class="card-value">{{ portfolio.totalItems || 0 }}</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="card-icon">📉</div>
        <div class="card-content">
          <h3>Return %</h3>
          <p class="card-value" :class="{ positive: portfolio.totalProfitLossPercent >= 0, negative: portfolio.totalProfitLossPercent < 0 }">
            {{ portfolio.totalProfitLossPercent >= 0 ? '+' : '' }}{{ formatPercent(portfolio.totalProfitLossPercent || 0) }}%
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Portfolio Performance Chart -->
        <div class="chart-section">
          <h3>Portfolio Performance</h3>
          <div class="chart-container">
            <Line 
              :data="chartData" 
              :options="chartOptions"
              :height="300"
            />
          </div>
        </div>

        <!-- Portfolio Items -->
        <div class="portfolio-section">
          <div class="section-header">
            <h3>Your Holdings</h3>
            <button @click="showBuyModal = true" class="btn btn-primary btn-sm">
              + Buy Stock
            </button>
          </div>
          
          <div v-if="loading && portfolio.items.length === 0" class="loading">
            Loading portfolio...
          </div>
          <div v-else-if="portfolio.items.length === 0" class="empty-state">
            <p>No stocks in your portfolio yet. Start by buying your first stock!</p>
          </div>
          <div v-else class="holdings-grid">
            <div
              v-for="item in portfolio.items"
              :key="item.id"
              class="holding-card"
            >
              <div class="holding-header">
                <div class="stock-info">
                  <h4>{{ item.stockTicker }}</h4>
                  <span class="stock-volume">{{ item.volume }} shares</span>
                </div>
                <div class="holding-actions">
                  <button @click="sellStock(item)" class="btn btn-outline btn-sm">
                    Sell
                  </button>
                  <button @click="deleteItem(item.id)" class="btn btn-danger btn-sm">
                    ×
                  </button>
                </div>
              </div>
              
              <div class="holding-details">
                <div class="price-row">
                  <span class="current-price">${{ formatCurrency(item.currentPrice || 0) }}</span>
                  <span class="price-change" :class="{ positive: (item.profitLoss || 0) >= 0, negative: (item.profitLoss || 0) < 0 }">
                    {{ (item.profitLoss || 0) >= 0 ? '+' : '' }}${{ formatCurrency(item.profitLoss || 0) }}
                  </span>
                </div>
                
                <div class="value-row">
                  <span class="total-value">Total: ${{ formatCurrency(item.totalValue || 0) }}</span>
                  <span class="return-percent" :class="{ positive: (item.profitLossPercent || 0) >= 0, negative: (item.profitLossPercent || 0) < 0 }">
                    {{ (item.profitLossPercent || 0) >= 0 ? '+' : '' }}{{ formatPercent(item.profitLossPercent || 0) }}%
                  </span>
                </div>
                
                <div class="cost-row">
                  <span class="avg-cost">Avg Cost: ${{ formatCurrency(item.averageBuyPrice || 0) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Market Watch -->
        <div class="market-watch">
          <div class="section-header">
            <h3>Market Watch</h3>
            <span class="last-updated">Last updated: {{ new Date().toLocaleTimeString() }}</span>
          </div>
          <div class="market-stocks">
            <div 
              v-for="stock in marketStocks" 
              :key="stock.ticker"
              class="market-stock"
              @click="selectStock(stock.ticker)"
            >
              <div class="stock-symbol">{{ stock.ticker }}</div>
              <div class="stock-price">${{ formatCurrency(stock.price) }}</div>
              <div class="stock-change" :class="{ positive: stock.change >= 0, negative: stock.change < 0 }">
                {{ stock.change >= 0 ? '+' : '' }}{{ formatPercent(stock.changePercent) }}%
              </div>
            </div>
          </div>
          <div class="market-info">
            <p>Click on any stock to buy</p>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="transactions-section">
          <h3>Recent Transactions</h3>
          <div class="transactions-list">
            <div 
              v-for="transaction in recentTransactions" 
              :key="transaction.id"
              class="transaction-item"
            >
              <div class="transaction-icon" :class="transaction.type.toLowerCase()">
                {{ transaction.type === 'BUY' ? '📈' : '📉' }}
              </div>
              <div class="transaction-details">
                <div class="transaction-stock">{{ transaction.stockTicker }}</div>
                <div class="transaction-info">
                  {{ transaction.volume }} shares @ ${{ formatCurrency(transaction.price) }}
                </div>
              </div>
              <div class="transaction-amount">
                ${{ formatCurrency(transaction.totalAmount) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Buy Stock Modal -->
    <div v-if="showBuyModal" class="modal-overlay" @click="showBuyModal = false">
      <div class="modal" @click.stop>
        <h3>Buy Stock</h3>
        <form @submit.prevent="buyStock" class="buy-form">
          <div class="form-group">
            <label>Stock Symbol:</label>
            <input
              v-model="buyForm.stockTicker"
              type="text"
              placeholder="e.g., AAPL"
              required
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Number of Shares:</label>
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
            <label>Price per Share (optional):</label>
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

    <!-- Sell Stock Modal -->
    <div v-if="showSellModal" class="modal-overlay" @click="showSellModal = false">
      <div class="modal" @click.stop>
        <h3>Sell Stock</h3>
        <form @submit.prevent="sellStockConfirm" class="sell-form">
          <div class="form-group">
            <label>Stock: {{ sellingItem?.stockTicker }}</label>
          </div>
          <div class="form-group">
            <label>Available Shares: {{ sellingItem?.volume }}</label>
          </div>
          <div class="form-group">
            <label>Number of Shares to Sell:</label>
            <input
              v-model.number="sellForm.volume"
              type="number"
              :max="sellingItem?.volume"
              min="1"
              required
              placeholder="Enter quantity"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Price per Share (optional):</label>
            <input
              v-model.number="sellForm.sellPrice"
              type="number"
              step="0.01"
              placeholder="Leave empty for market price"
              class="form-input"
            />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showSellModal = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="loading" class="btn btn-danger">
              {{ loading ? 'Selling...' : 'Sell Stock' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Stock Detail Modal -->
    <div v-if="showStockDetail" class="modal-overlay" @click="showStockDetail = false">
      <div class="modal" @click.stop>
        <h3>Stock Details - {{ selectedStock?.ticker }}</h3>
        <div v-if="selectedStock" class="stock-details">
          <div class="detail-row">
            <span class="detail-label">Current Price:</span>
            <span class="detail-value">${{ formatCurrency(selectedStock.price) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Change:</span>
            <span class="detail-value" :class="{ positive: selectedStock.change >= 0, negative: selectedStock.change < 0 }">
              {{ selectedStock.change >= 0 ? '+' : '' }}${{ formatCurrency(selectedStock.change) }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Change %:</span>
            <span class="detail-value" :class="{ positive: selectedStock.changePercent >= 0, negative: selectedStock.changePercent < 0 }">
              {{ selectedStock.changePercent >= 0 ? '+' : '' }}{{ formatPercent(selectedStock.changePercent) }}%
            </span>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showStockDetail = false" class="btn btn-secondary">
            Close
          </button>
          <button @click="buyStockFromDetail" class="btn btn-primary">
            Buy This Stock
          </button>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
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
      totalValue: 0,
      totalCost: 0,
      totalProfitLoss: 0,
      totalProfitLossPercent: 0,
      items: []
    });
    const loading = ref(false);
    const error = ref('');
    const searchQuery = ref('');
    const searchResults = ref([]);
    const marketStocks = ref([]);
    const recentTransactions = ref([]);
    const showBuyModal = ref(false);
    const showSellModal = ref(false);
    const sellingItem = ref(null);
    const showStockDetail = ref(false);
    const selectedStock = ref(null);
    
    const buyForm = ref({
      stockTicker: '',
      volume: 1,
      buyPrice: null
    });
    
    const sellForm = ref({
      volume: 1,
      sellPrice: null
    });

    // 图表数据 - 静态数据
    const chartData = ref({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Portfolio Value',
          data: [10000, 10500, 11200, 10800, 11500, 12200, 11800, 12500, 13200, 12800, 13500, 14200],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
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
          borderColor: '#667eea',
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
            color: '#718096',
            font: {
              size: 12
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(113, 128, 150, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: '#718096',
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

    const loadPortfolio = async () => {
      loading.value = true;
      error.value = '';
      try {
        const response = await api.get('/portfolio');
        portfolio.value = response.data;
      } catch (err) {
        error.value = 'Failed to load portfolio';
        console.error('Error loading portfolio:', err);
      } finally {
        loading.value = false;
      }
    };

    const loadMarketStocks = async () => {
      try {
        const popularTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
        const stocks = [];
        
        for (const ticker of popularTickers) {
          try {
            const response = await api.get(`/portfolio/meta/stock-price?ticker=${ticker}`);
            if (response.data && response.data.price) {
              stocks.push({
                ticker: ticker,
                price: response.data.price,
                change: response.data.change || 0,
                changePercent: response.data.changePercent || 0
              });
            }
          } catch (err) {
            console.error(`Error loading ${ticker}:`, err);
            // 添加默认数据以防API失败
            stocks.push({
              ticker: ticker,
              price: 0,
              change: 0,
              changePercent: 0
            });
          }
        }
        
        marketStocks.value = stocks;
      } catch (err) {
        console.error('Error loading market stocks:', err);
      }
    };

    const loadTransactions = async () => {
      try {
        const response = await api.get('/portfolio/transactions');
        recentTransactions.value = response.data.transactions.slice(0, 5); // Show last 5 transactions
      } catch (err) {
        console.error('Error loading transactions:', err);
      }
    };

    const searchStocks = async () => {
      if (searchQuery.value.length < 2) {
        searchResults.value = [];
        return;
      }

      try {
        const response = await api.get(`/portfolio/meta/search?query=${searchQuery.value}`);
        if (response.data && response.data.results) {
          searchResults.value = response.data.results.slice(0, 5); // Limit to 5 results
        } else {
          searchResults.value = [];
        }
      } catch (err) {
        console.error('Error searching stocks:', err);
        // 如果搜索失败，提供一些热门股票作为备选
        searchResults.value = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
      }
    };

    const selectStock = (ticker) => {
      // 查找选中的股票详情
      const stock = marketStocks.value.find(s => s.ticker === ticker);
      if (stock) {
        selectedStock.value = stock;
        showStockDetail.value = true;
      } else {
        // 如果不在市场观察列表中，直接打开买入模态框
        buyForm.value.stockTicker = ticker;
        searchQuery.value = '';
        searchResults.value = [];
        showBuyModal.value = true;
      }
    };

    const buyStockFromDetail = () => {
      if (selectedStock.value) {
        buyForm.value.stockTicker = selectedStock.value.ticker;
        buyForm.value.buyPrice = selectedStock.value.price;
        showStockDetail.value = false;
        showBuyModal.value = true;
      }
    };

    const buyStock = async () => {
      if (!buyForm.value.stockTicker || !buyForm.value.volume) {
        error.value = 'Please fill in all required fields';
        return;
      }

      loading.value = true;
      error.value = '';
      try {
        // 如果没有指定价格，先获取当前市场价格
        let marketPrice = buyForm.value.buyPrice;
        if (!marketPrice) {
          try {
            const priceResponse = await api.get(`/portfolio/meta/stock-price?ticker=${buyForm.value.stockTicker.toUpperCase()}`);
            if (priceResponse.data && priceResponse.data.price) {
              marketPrice = priceResponse.data.price;
            } else {
              throw new Error('Unable to get current market price');
            }
          } catch (priceErr) {
            error.value = `Unable to get current price for ${buyForm.value.stockTicker}. Please specify a price manually.`;
            loading.value = false;
            return;
          }
        }

        const buyData = {
          stockTicker: buyForm.value.stockTicker.toUpperCase(),
          volume: buyForm.value.volume,
          buyPrice: marketPrice
        };

        await api.post('/portfolio/buy', buyData);
        
        // Reset form
        buyForm.value = {
          stockTicker: '',
          volume: 1,
          buyPrice: null
        };
        showBuyModal.value = false;
        
        // Reload data
        await loadPortfolio();
        await loadTransactions();
        await loadMarketStocks(); // 重新加载市场数据
      } catch (err) {
        error.value = err.response?.data?.error || 'Failed to buy stock';
        console.error('Error buying stock:', err);
      } finally {
        loading.value = false;
      }
    };

    const sellStock = (item) => {
      sellingItem.value = item;
      sellForm.value = {
        volume: 1,
        sellPrice: null
      };
      showSellModal.value = true;
    };

    const sellStockConfirm = async () => {
      if (!sellingItem.value || !sellForm.value.volume) {
        error.value = 'Please fill in all required fields';
        return;
      }

      if (sellForm.value.volume > sellingItem.value.volume) {
        error.value = 'Cannot sell more shares than you own';
        return;
      }

      loading.value = true;
      error.value = '';
      try {
        // 如果没有指定价格，获取当前市场价格
        let marketPrice = sellForm.value.sellPrice;
        if (!marketPrice) {
          try {
            const priceResponse = await api.get(`/portfolio/meta/stock-price?ticker=${sellingItem.value.stockTicker}`);
            if (priceResponse.data && priceResponse.data.price) {
              marketPrice = priceResponse.data.price;
            } else {
              throw new Error('Unable to get current market price');
            }
          } catch (priceErr) {
            error.value = `Unable to get current price for ${sellingItem.value.stockTicker}. Please specify a price manually.`;
            loading.value = false;
            return;
          }
        }

        const sellData = {
          id: sellingItem.value.id,
          volume: sellForm.value.volume,
          sellPrice: marketPrice
        };

        await api.post('/portfolio/sell', sellData);
        
        // Reset form
        sellForm.value = {
          volume: 1,
          sellPrice: null
        };
        sellingItem.value = null;
        showSellModal.value = false;
        
        // Reload data
        await loadPortfolio();
        await loadTransactions();
        await loadMarketStocks(); // 重新加载市场数据
      } catch (err) {
        error.value = err.response?.data?.error || 'Failed to sell stock';
        console.error('Error selling stock:', err);
      } finally {
        loading.value = false;
      }
    };

    const deleteItem = async (id) => {
      if (!confirm('Are you sure you want to delete this item?')) {
        return;
      }

      loading.value = true;
      error.value = '';
      try {
        await api.delete(`/portfolio/${id}`);
        await loadPortfolio();
      } catch (err) {
        error.value = 'Failed to delete item';
        console.error('Error deleting item:', err);
      } finally {
        loading.value = false;
      }
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
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

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString();
    };

    // 自动刷新股票价格
    let refreshInterval = null;

    const startAutoRefresh = () => {
      refreshInterval = setInterval(() => {
        loadMarketStocks();
        loadPortfolio(); // 更新投资组合中的价格
      }, 30000); // 每30秒刷新一次
    };

    const stopAutoRefresh = () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
    };

    onMounted(() => {
      loadPortfolio();
      loadMarketStocks();
      loadTransactions();
      startAutoRefresh();
    });

    // 组件卸载时清理定时器
    onUnmounted(() => {
      stopAutoRefresh();
    });

    return {
      portfolio,
      loading,
      error,
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
      searchStocks,
      selectStock,
      buyStock,
      sellStock,
      sellStockConfirm,
      deleteItem,
      buyStockFromDetail,
      formatCurrency,
      formatPercent,
      formatDate
    };
  }
};
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px 30px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.header-left h1 {
  color: #2d3748;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.header-center {
  flex: 1;
  max-width: 400px;
  margin: 0 20px;
}

.search-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 25px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.search-result-item {
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f7fafc;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.username {
  color: #2d3748;
  font-weight: 600;
}

.profile-avatar {
  width: 40px;
  height: 40px;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-5px);
}

.balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(255,255,255,0.2);
}

.card-content {
  flex: 1;
}

.card-content h3 {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0.8;
}

.card-value {
  margin: 0 0 5px 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.card-change {
  font-size: 0.9rem;
  font-weight: 600;
}

.card-change.positive {
  color: #48bb78;
}

.card-change.negative {
  color: #f56565;
}

/* Main Content */
.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Chart Section */
.chart-section {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.chart-section h3 {
  margin: 0 0 20px 0;
  color: #2d3748;
  font-size: 1.3rem;
  font-weight: 600;
}

.chart-container {
  height: 300px;
  position: relative;
  width: 100%;
}

/* Portfolio Section */
.portfolio-section {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.3rem;
  font-weight: 600;
}

.loading, .empty-state {
  text-align: center;
  padding: 40px;
  color: #718096;
}

.holdings-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.holding-card {
  background: #f7fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.holding-card:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.holding-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.stock-info h4 {
  margin: 0 0 5px 0;
  color: #2d3748;
  font-size: 1.2rem;
  font-weight: 600;
}

.stock-volume {
  color: #718096;
  font-size: 0.9rem;
}

.holding-actions {
  display: flex;
  gap: 8px;
}

.holding-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-row, .value-row, .cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
}

.price-change {
  font-weight: 600;
  font-size: 0.9rem;
}

.price-change.positive {
  color: #48bb78;
}

.price-change.negative {
  color: #f56565;
}

.total-value {
  color: #718096;
  font-size: 0.9rem;
}

.return-percent {
  font-weight: 600;
  font-size: 0.9rem;
}

.return-percent.positive {
  color: #48bb78;
}

.return-percent.negative {
  color: #f56565;
}

.avg-cost {
  color: #718096;
  font-size: 0.85rem;
}

/* Market Watch */
.market-watch {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.market-watch .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.market-watch h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.3rem;
  font-weight: 600;
}

.last-updated {
  font-size: 0.8rem;
  color: #718096;
}

.market-info {
  margin-top: 15px;
  text-align: center;
}

.market-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #718096;
  font-style: italic;
}

.market-stocks {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.market-stock {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f7fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.market-stock:hover {
  background: #edf2f7;
  transform: translateX(5px);
}

.stock-symbol {
  font-weight: 600;
  color: #2d3748;
}

.stock-price {
  font-weight: 600;
  color: #2d3748;
}

.stock-change {
  font-weight: 600;
  font-size: 0.9rem;
}

.stock-change.positive {
  color: #48bb78;
}

.stock-change.negative {
  color: #f56565;
}

/* Transactions */
.transactions-section {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.transactions-section h3 {
  margin: 0 0 20px 0;
  color: #2d3748;
  font-size: 1.3rem;
  font-weight: 600;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 15px;
  background: #f7fafc;
  border-radius: 8px;
}

.transaction-icon {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.transaction-icon.buy {
  background: #c6f6d5;
  color: #38a169;
}

.transaction-icon.sell {
  background: #fed7d7;
  color: #e53e3e;
}

.transaction-details {
  flex: 1;
}

.transaction-stock {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 2px;
}

.transaction-info {
  font-size: 0.85rem;
  color: #718096;
}

.transaction-amount {
  font-weight: 600;
  color: #2d3748;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.btn-secondary {
  background: #718096;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4a5568;
}

.btn-danger {
  background: #f56565;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #e53e3e;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.modal h3 {
  margin: 0 0 25px 0;
  color: #2d3748;
  font-size: 1.4rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2d3748;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
}

/* Error Message */
.error-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #fed7d7;
  color: #c53030;
  padding: 15px 20px;
  border-radius: 8px;
  border: 1px solid #feb2b2;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  z-index: 1001;
  max-width: 400px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }
  
  .header-center {
    max-width: 100%;
    margin: 0;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .holding-actions {
    flex-direction: column;
    gap: 5px;
  }
  
  .modal {
    width: 95%;
    padding: 20px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .holding-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .price-row, .value-row, .cost-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}

/* Stock Details Modal */
.stock-details {
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #2d3748;
}

.detail-value {
  font-weight: 600;
}

.detail-value.positive {
  color: #48bb78;
}

.detail-value.negative {
  color: #f56565;
}
</style> 