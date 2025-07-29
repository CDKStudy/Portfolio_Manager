<template>
  <div class="dashboard">
    <!-- Portfolio Summary Cards -->
    <section class="portfolio-summary">
      <div class="summary-card total-portfolio">
        <div class="card-header">
          <span class="card-title">Total Portfolio Value</span>
          <i class="card-icon">💰</i>
        </div>
        <div class="card-content">
          <div class="card-value">${{ formatCurrency(portfolio.netWorth) }}</div>
          <!-- <div class="card-change positive">
            <span class="change-icon">📈</span>
            <span>+2.5% from last month</span>
          </div> -->
        </div>
      </div>

      <div class="summary-card stocks">
        <div class="card-header">
          <span class="card-title">Stocks</span>
          <i class="card-icon">📊</i>
        </div>
        <div class="card-content">
          <div class="card-value">${{ formatCurrency(stockHoldings.totalValue) }}</div>
          <!-- <div class="card-change positive">
            <span class="change-icon">📈</span>
            <span>+4.3% from last month</span>
          </div> -->
        </div>
      </div>

      <div class="summary-card funds">
        <div class="card-header">
          <span class="card-title">Funds</span>
          <i class="card-icon">📊</i>
        </div>
        <div class="card-content">
          <div class="card-value">${{ formatCurrency(fundHoldings.totalValue) }}</div>
          <!-- <div class="card-change negative">
            <span class="change-icon">📉</span>
            <span>-0.8% from last month</span>
          </div> -->
        </div>
      </div>

      <div class="summary-card cash">
        <div class="card-header">
          <span class="card-title">Cash</span>
          <i class="card-icon">💰</i>
        </div>
        <div class="card-content">
          <div class="card-value">${{ formatCurrency(userInfo.cash) }}</div>
          <!-- <div class="card-change neutral">
            <span>+0.1% interest rate</span>
          </div> -->
        </div>
      </div>
    </section>

    <!-- Portfolio Performance Chart -->
    <section class="dashboard-chart">
      <div class="chart-card performance-chart">
        <h3>Portfolio Performance</h3>
        <div class="chart-container">
          <Line 
            :data="chartData" 
            :options="chartOptions"
          />
        </div>
      </div>
    </section>

    <!-- Holdings Overview -->
    <section class="holdings-overview">
      <div class="holdings-card">
        <div class="holdings-header">
          <h3>Your Holdings Overview</h3>
        </div>
        
        <div v-if="loading && allHoldings.length === 0" class="loading-state">
          <div class="spinner"></div>
          <p>Loading portfolio...</p>
        </div>
        <div v-else-if="allHoldings.length === 0" class="empty-state">
          <div class="empty-icon">📈</div>
          <p>No holdings in your portfolio yet</p>
          <p class="empty-subtitle">Start by adding your first asset!</p>
        </div>
        <div v-else class="holdings-list">
          <div
            v-for="holding in allHoldings"
            :key="holding.id"
            class="holding-item"
          >
            <div class="holding-info">
              <div class="stock-symbol">{{ holding.ticker }}</div>
              <div class="stock-name">{{ holding.quantity }} {{ holding.type === 'fund' ? 'units' : 'shares' }}</div>
              <div class="holding-type" :class="holding.type">
                {{ holding.type.toUpperCase() }}
              </div>
            </div>
            <div class="holding-values">
              <div class="current-value">${{ formatCurrency(holding.currentPrice || holding.buyPrice) }}</div>
              <div class="profit-loss" :class="{ positive: (holding.profitLoss || 0) >= 0, negative: (holding.profitLoss || 0) < 0 }">
                {{ (holding.profitLoss || 0) >= 0 ? '+' : '' }}${{ formatCurrency(holding.profitLoss || 0) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Market Watch -->
      <div class="market-watch-card">
        <h3>Market Watch</h3>
        <div class="market-list">
          <div 
            v-for="stock in marketStocks" 
            :key="stock.ticker"
            class="market-item"
          >
            <div class="market-symbol">{{ stock.ticker }}</div>
            <div class="market-price">${{ formatCurrency(stock.price) }}</div>
            <div class="market-change" :class="{ positive: stock.change >= 0, negative: stock.change < 0 }">
              {{ stock.change >= 0 ? '+' : '' }}{{ formatPercent(stock.changePercent) }}%
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Error Message -->
    <div v-if="error" class="error-toast">
      <span>{{ error }}</span>
      <button @click="error = ''" class="close-btn">×</button>
    </div>
  </div>
</template>

<script>
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import { onMounted, ref } from 'vue';
import { Line } from 'vue-chartjs';
import { portfolioAPI, stockAPI } from '../services/api';

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
  name: 'Dashboard',
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
    //Empty array for market stocks
    const marketStocks = ref([]);
    // const marketStocks = ref([
    //   { ticker: 'AAPL', price: 213.88, change: 1.28, changePercent: 0.06 },
    //   { ticker: 'MSFT', price: 513.71, change: 2.82, changePercent: 0.55 },
    //   { ticker: 'GOOGL', price: 193.18, change: 1.02, changePercent: 0.53 },
    //   { ticker: 'AMZN', price: 231.44, change: -0.79, changePercent: -0.34 },
    //   { ticker: 'TSLA', price: 316.06, change: 11.11, changePercent: 3.52 },
    //   { ticker: 'META', price: 712.68, change: -2.14, changePercent: -0.30 }
    // ]);
    const userInfo = ref({
      id: 1,
      username: 'john_doe',
      cash: 4272.89,
      netWorth: 45231.89
    });
    const allHoldings = ref([]);
    const stockHoldings = ref({
      items: [],
      totalValue: 28459.00
    });
    const fundHoldings = ref({
      items: [],
      totalValue: 12500.00
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

    // Load portfolio data
    const loadPortfolio = async () => {
      loading.value = true;
      try {
        // Load portfolio summary
        const portfolioResponse = await portfolioAPI.getPortfolio();
        portfolio.value = portfolioResponse.data;

        // Load user info
        const userResponse = await portfolioAPI.getUser();
        userInfo.value = userResponse.data;

        // Load holdings
        const holdingsResponse = await portfolioAPI.getHoldings();
        allHoldings.value = holdingsResponse.data.holdings || [];

        // Separate stocks and funds
        stockHoldings.value.items = allHoldings.value.filter(h => h.type === 'stock');
        fundHoldings.value.items = allHoldings.value.filter(h => h.type === 'fund');

        // Calculate totals
        stockHoldings.value.totalValue = stockHoldings.value.items.reduce((sum, h) => 
          sum + (h.totalValue || (h.quantity * (h.currentPrice || h.buyPrice))), 0);
        fundHoldings.value.totalValue = fundHoldings.value.items.reduce((sum, h) => 
          sum + (h.totalValue || (h.quantity * (h.currentPrice || h.buyPrice))), 0);

      } catch (err) {
        error.value = 'Failed to load portfolio';
        console.error('Error loading portfolio:', err);
      } finally {
        loading.value = false;
      }
    };

    // Load real-time market watch data
    const loadMarketStocks = async () => {
      try {
        const res = await stockAPI.getMarketWatch();
        marketStocks.value = res.data.stocks;

      } catch (err) {
        error.value = 'Failed to load market data';
        console.error('Error loading market stocks:', err);
      }
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

      loadMarketStocks();
    });

  
    return {
      portfolio,
      loading,
      error,
      marketStocks,
      userInfo,
      allHoldings,
      stockHoldings,
      fundHoldings,
      chartData,
      chartOptions,
      formatCurrency,
      formatPercent
    };
  }
};
</script>

<style scoped>
.dashboard {
  padding: 24px;
  background: #f9fafb;
  min-height: 100vh;
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
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
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
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-icon {
  font-size: 24px;
}

.card-content {
  text-align: left;
}

.card-value {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.card-change {
  display: flex;
  align-items: center;
  gap: 8px;
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
  font-size: 16px;
}

/* Dashboard Chart */
.dashboard-chart {
  margin-bottom: 32px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.chart-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
}

.chart-container {
  height: 400px;
  width: 100%;
}

/* Holdings Overview */
.holdings-overview {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.holdings-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.holdings-header {
  margin-bottom: 24px;
}

.holdings-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-subtitle {
  font-size: 14px;
  margin-top: 8px;
}

.market-list {
  max-height: 300px; 
  overflow-y: auto;
  padding-right: 4px; 
}


.holding-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  margin-bottom: 12px;
}

.holding-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stock-symbol {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
}

.stock-name {
  color: #6b7280;
  font-size: 14px;
}

.holding-type {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-top: 4px;
  width: fit-content;
}

.holding-type.stock {
  background: #dbeafe;
  color: #1e40af;
}

.holding-type.fund {
  background: #fef3c7;
  color: #92400e;
}

.holding-values {
  text-align: right;
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

/* Market Watch */
.market-watch-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.market-watch-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
}

.market-list {
  space-y: 12px;
}

.market-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  margin-bottom: 12px;
}

.market-item:hover {
  background: #f9fafb;
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

/* Error Message */
.error-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #ef4444;
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }
  
  .portfolio-summary {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .holdings-overview {
    grid-template-columns: 1fr;
  }
  
  .card-value {
    font-size: 24px;
  }
}
</style> 