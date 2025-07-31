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
          <div class="total-value">
            <span class="total-label">Total Portfolio Value:</span>
            <span class="total-amount">${{ formatCurrency(totalPortfolioValue) }}</span>
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
          <div class="total-value">
            <span class="total-label">Total Stocks Value:</span>
            <span class="total-amount">${{ formatCurrency(totalStocksValue) }}</span>
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
          <div class="total-value">
            <span class="total-label">Total Funds Value:</span>
            <span class="total-amount">${{ formatCurrency(totalFundsValue) }}</span>
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
          actualValues: [
            this.assetAllocation.cash.value || 0,
            this.assetAllocation.stocks.value || 0,
            this.assetAllocation.funds.value || 0
          ],
          backgroundColor: [
            '#93c5fd', // Light blue for cash
            '#6ee7b7', // Light green for stocks
            '#fcd34d'  // Light yellow for funds
          ],
          borderColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b'
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
          actualValues: this.stockHoldings.map(holding => holding.value || 0),
          backgroundColor: [
            '#93c5fd', '#6ee7b7', '#fcd34d', '#fca5a5', '#c4b5fd',
            '#67e8f9', '#bef264', '#fdba74', '#f9a8d4', '#a5b4fc'
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
          actualValues: this.fundHoldings.map(holding => holding.value || 0),
          backgroundColor: [
            '#93c5fd', '#6ee7b7', '#fcd34d', '#fca5a5', '#c4b5fd',
            '#67e8f9', '#bef264', '#fdba74', '#f9a8d4', '#a5b4fc'
          ],
          borderWidth: 2
        }]
      }
    },

    // Total portfolio value
    totalPortfolioValue() {
      if (!this.assetAllocation) return 0
      return (this.assetAllocation.cash.value || 0) + 
             (this.assetAllocation.stocks.value || 0) + 
             (this.assetAllocation.funds.value || 0)
    },

    // Total stocks value
    totalStocksValue() {
      if (!this.assetAllocation) return 0
      return this.assetAllocation.stocks.value || 0
    },

    // Total funds value
    totalFundsValue() {
      if (!this.assetAllocation) return 0
      return this.assetAllocation.funds.value || 0
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
              color: '#1f2937',
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
                const datasetIndex = context.datasetIndex
                const dataIndex = context.dataIndex
                
                // Get the actual value based on chart type
                let actualValue = 0
                if (context.chart.data.datasets[datasetIndex].actualValues) {
                  actualValue = context.chart.data.datasets[datasetIndex].actualValues[dataIndex] || 0
                }
                
                return [
                  `${label}: ${value.toFixed(1)}%`,
                  `Value: $${actualValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                ]
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
              color: '#1f2937',
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
              color: '#6b7280'
            },
            grid: {
              color: '#e5e7eb'
            }
          },
          y: {
            ticks: {
              color: '#6b7280',
              callback: function(value) {
                return '$' + value.toLocaleString()
              }
            },
            grid: {
              color: '#e5e7eb'
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
    formatCurrency(value) {
      if (value === null || value === undefined) return '0.00'
      return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
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
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          },
          {
            label: 'Stocks',
            data: stocksData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            tension: 0.4
          },
          {
            label: 'Funds',
            data: fundsData,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.05)',
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
  padding: 24px;
  color: #1f2937;
  min-height: 100vh;
  background: #f9fafb;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  position: relative;
}

.analytics-header {
  margin-bottom: 2rem;
  text-align: center;
  padding: 2rem 0 0 0;
}

.analytics-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
  font-weight: 600;
}

.analytics-header p {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

.analytics-section {
  margin-bottom: 3rem;
  padding: 0 48px;
}

.analytics-section h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
  font-weight: 600;
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
  background: white;
  border-radius: 12px;
  padding: 1.2rem;
  border: 1px solid #e5e7eb;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  min-width: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.pie-chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.pie-chart-card h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #1f2937;
  text-align: center;
  font-weight: 600;
}

.pie-chart-container {
  height: 250px;
  position: relative;
}

.total-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-top: 16px;
  border: 1px solid #e2e8f0;
}

.total-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.total-amount {
  font-size: 1.1rem;
  color: #1f2937;
  font-weight: 600;
}

.line-chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.line-chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.line-chart-card h3 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: #1f2937;
  text-align: center;
  font-weight: 600;
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
  color: #6b7280;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
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
  color: #ef4444;
}

.retry-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background-color 0.3s ease;
  font-weight: 500;
}

.retry-btn:hover {
  background: #2563eb;
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