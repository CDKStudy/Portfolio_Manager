<template>
  <div class="analytics-container">
    <div class="analytics-header">
      <h1>Analytics</h1>
      <p>Portfolio performance and asset allocation analysis</p>
    </div>

    <!-- Asset Allocation Section -->
    <div class="analytics-section">
      <h2>Asset Allocation</h2>
      <div class="pie-charts-row">
        <!-- Overall Asset Allocation -->
        <div class="pie-chart-card">
          <h3>Overall Asset Allocation</h3>
          <div class="pie-chart-container">
            <PieChart 
              v-if="assetAllocationData"
              :data="assetAllocationData"
              :options="pieChartOptions"
            />
          </div>
        </div>

        <!-- Stock Holdings -->
        <div class="pie-chart-card">
          <h3>Stock Holdings</h3>
          <div class="pie-chart-container">
            <PieChart 
              v-if="stockHoldingsData"
              :data="stockHoldingsData"
              :options="pieChartOptions"
            />
          </div>
        </div>

        <!-- Fund Holdings -->
        <div class="pie-chart-card">
          <h3>Fund Holdings</h3>
          <div class="pie-chart-container">
            <PieChart 
              v-if="fundHoldingsData"
              :data="fundHoldingsData"
              :options="pieChartOptions"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Asset Performance Section -->
    <div class="analytics-section">
      <h2>Asset Performance Trends</h2>
      <div class="line-chart-card">
        <h3>Portfolio Value Over Time</h3>
        <div class="line-chart-container">
          <LineChart 
            v-if="performanceData"
            :data="performanceData"
            :options="lineChartOptions"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading analytics data...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadAnalyticsData" class="retry-btn">Retry</button>
    </div>
  </div>
</template>

<script>
import { Pie as PieChart, Line as LineChart } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js'
import { portfolioAPI } from '../services/api.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title)

export default {
  name: 'Analytics',
  components: {
    PieChart,
    LineChart
  },
  data() {
    return {
      loading: false,
      error: null,
      assetAllocation: null,
      stockHoldings: [],
      fundHoldings: [],
      performanceData: null
    }
  },
  computed: {
    // Overall asset allocation data for pie chart
    assetAllocationData() {
      if (!this.assetAllocation) return null
      
      return {
        labels: ['Cash', 'Stocks', 'Funds'],
        datasets: [{
          data: [
            this.assetAllocation.cash.percentage,
            this.assetAllocation.stocks.percentage,
            this.assetAllocation.funds.percentage
          ],
          backgroundColor: [
            '#FFD700', // Gold for cash
            '#4CAF50', // Green for stocks
            '#2196F3'  // Blue for funds
          ],
          borderColor: [
            '#FFC107',
            '#388E3C',
            '#1976D2'
          ],
          borderWidth: 2
        }]
      }
    },

    // Stock holdings data for pie chart
    stockHoldingsData() {
      if (this.stockHoldings.length === 0) return null
      
      return {
        labels: this.stockHoldings.map(holding => holding.ticker),
        datasets: [{
          data: this.stockHoldings.map(holding => holding.percentage),
          backgroundColor: [
            '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107',
            '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'
          ],
          borderWidth: 2
        }]
      }
    },

    // Fund holdings data for pie chart
    fundHoldingsData() {
      if (this.fundHoldings.length === 0) return null
      
      return {
        labels: this.fundHoldings.map(holding => holding.ticker),
        datasets: [{
          data: this.fundHoldings.map(holding => holding.percentage),
          backgroundColor: [
            '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
            '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800'
          ],
          borderWidth: 2
        }]
      }
    },

    // Pie chart options
    pieChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#ffffff',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || ''
                const value = context.parsed || 0
                return `${label}: ${value.toFixed(1)}%`
              }
            }
          }
        }
      }
    },

    // Line chart options
    lineChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#ffffff',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || ''
                const value = context.parsed.y || 0
                return `${label}: $${value.toLocaleString()}`
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#ffffff'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            ticks: {
              color: '#ffffff',
              callback: function(value) {
                return '$' + value.toLocaleString()
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        }
      }
    }
  },
  mounted() {
    this.loadAnalyticsData()
    this.generatePerformanceData()
  },
  methods: {
    async loadAnalyticsData() {
      this.loading = true
      this.error = null
      
      try {
        const response = await portfolioAPI.getAssetAllocation()
        this.assetAllocation = response.data.assetAllocation
        this.stockHoldings = response.data.stockHoldings
        this.fundHoldings = response.data.fundHoldings
      } catch (error) {
        console.error('Error loading analytics data:', error)
        this.error = 'Failed to load analytics data. Please try again.'
      } finally {
        this.loading = false
      }
    },

    // Generate simulated performance data
    generatePerformanceData() {
      const days = 30
      const labels = []
      const cashData = []
      const stocksData = []
      const fundsData = []
      
      // Generate dates for the last 30 days
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      }

      // Generate simulated data
      let cashValue = 50000
      let stocksValue = 30000
      let fundsValue = 20000

      for (let i = 0; i < days; i++) {
        // Add some random variation
        cashValue += (Math.random() - 0.5) * 1000
        stocksValue += (Math.random() - 0.4) * 800
        fundsValue += (Math.random() - 0.3) * 600

        cashData.push(Math.max(0, cashValue))
        stocksData.push(Math.max(0, stocksValue))
        fundsData.push(Math.max(0, fundsValue))
      }

      this.performanceData = {
        labels,
        datasets: [
          {
            label: 'Cash',
            data: cashData,
            borderColor: '#FFD700',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            tension: 0.4
          },
          {
            label: 'Stocks',
            data: stocksData,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4
          },
          {
            label: 'Funds',
            data: fundsData,
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            tension: 0.4
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
.analytics-container {
  padding: 0;
  color: #ffffff;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  width: 99%;
  max-width: 99%;
  overflow-x: hidden;
}

.analytics-header {
  margin-bottom: 2rem;
  text-align: center;
  padding: 2rem 0 0 0;
}

.analytics-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.analytics-header p {
  font-size: 1.1rem;
  color: #b0b0b0;
  margin: 0;
}

.analytics-section {
  margin-bottom: 3rem;
  padding: 0 48px;
}

.analytics-section h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #ffffff;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.5rem;
}

.pie-charts-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  justify-content: space-between;
  width: 100%;
}

.pie-chart-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  min-width: 0;
}

.pie-chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.pie-chart-card h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #ffffff;
  text-align: center;
}

.pie-chart-container {
  height: 250px;
  position: relative;
}

.line-chart-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
}

.line-chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.line-chart-card h3 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: #ffffff;
  text-align: center;
}

.line-chart-container {
  height: 400px;
  position: relative;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #ffffff;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 2rem;
  color: #ff6b6b;
}

.retry-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background: #45a049;
}

/* Responsive design */
@media (max-width: 1200px) {
  .pie-charts-row {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .pie-chart-card {
    min-width: auto;
  }
  
  .pie-chart-container {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .analytics-section {
    padding: 0 24px;
  }

  .pie-charts-row {
    gap: 1rem;
  }

  .pie-chart-card {
    padding: 1rem;
  }

  .pie-chart-container {
    height: 250px;
  }

  .line-chart-container {
    height: 300px;
  }

  .analytics-header h1 {
    font-size: 2rem;
  }
}
</style> 