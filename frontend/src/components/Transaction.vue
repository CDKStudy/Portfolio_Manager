<template>
  <div class="transaction-page">
    <!-- Header -->
    <div class="page-header">
      <h1>Transaction History</h1>
      <p class="subtitle">View your stock and fund transaction records</p>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label for="assetType">Asset Type:</label>
        <select id="assetType" v-model="selectedAssetType" @change="loadTransactions">
          <option value="all">All</option>
          <option value="stock">Stocks</option>
          <option value="fund">Funds</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="actionType">Action:</label>
        <select id="actionType" v-model="selectedAction" @change="loadTransactions">
          <option value="all">All</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="limit">Records:</label>
        <select id="limit" v-model="limit" @change="loadTransactions">
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading transactions...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadTransactions" class="btn btn-primary">Retry</button>
    </div>

    <!-- Transactions List -->
    <div v-else class="transactions-container">
      <div v-if="filteredTransactions.length === 0" class="empty-state">
        <p>No transactions found</p>
      </div>
      
      <div v-else class="transactions-list">
        <div 
          v-for="transaction in filteredTransactions" 
          :key="transaction.id" 
          class="transaction-card"
          :class="transaction.action"
        >
          <div class="transaction-header">
            <div class="transaction-type">
              <span class="type-badge" :class="transaction.assetType">
                {{ transaction.assetType.toUpperCase() }}
              </span>
              <span class="action-badge" :class="transaction.action">
                {{ transaction.action.toUpperCase() }}
              </span>
            </div>
            <div class="transaction-date">
              {{ formatDate(transaction.timestamp) }}
            </div>
          </div>
          
          <div class="transaction-details">
            <div class="ticker-info">
              <h3>{{ transaction.ticker }}</h3>
              <p class="quantity">
                {{ transaction.quantity }} {{ transaction.assetType === 'stock' ? 'shares' : 'units' }}
              </p>
            </div>
            
            <div class="price-info">
              <div class="price">
                ${{ formatCurrency(transaction.price) }}
              </div>
              <div class="total">
                Total: ${{ formatCurrency(transaction.quantity * transaction.price) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredTransactions.length > 0" class="pagination">
      <button 
        @click="loadMore" 
        :disabled="loading" 
        class="btn btn-secondary"
      >
        Load More
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { portfolioAPI } from '../services/api.js'

export default {
  name: 'Transaction',
  setup() {
    const transactions = ref([])
    const loading = ref(false)
    const error = ref('')
    const selectedAssetType = ref('all')
    const selectedAction = ref('all')
    const limit = ref(20)
    const currentPage = ref(1)

    // Load transactions from API
    const loadTransactions = async () => {
      loading.value = true
      error.value = ''
      
      try {
        const response = await portfolioAPI.getTransactions(1, limit.value)
        transactions.value = response.data.transactions || []
      } catch (err) {
        error.value = 'Failed to load transactions'
        console.error('Error loading transactions:', err)
      } finally {
        loading.value = false
      }
    }

    // Load more transactions
    const loadMore = async () => {
      currentPage.value++
      const newLimit = limit.value * currentPage.value
      
      try {
        const response = await portfolioAPI.getTransactions(1, newLimit)
        transactions.value = response.data.transactions || []
      } catch (err) {
        console.error('Error loading more transactions:', err)
      }
    }

    // Filter transactions based on selected criteria
    const filteredTransactions = computed(() => {
      let filtered = transactions.value

      // Filter by asset type (exclude cash transactions)
      filtered = filtered.filter(t => t.assetType !== 'cash')

      // Filter by selected asset type
      if (selectedAssetType.value !== 'all') {
        filtered = filtered.filter(t => t.assetType === selectedAssetType.value)
      }

      // Filter by action
      if (selectedAction.value !== 'all') {
        filtered = filtered.filter(t => t.action === selectedAction.value)
      }

      return filtered
    })

    // Format currency
    const formatCurrency = (value) => {
      return parseFloat(value).toFixed(2)
    }

    // Format date
    const formatDate = (timestamp) => {
      const date = new Date(timestamp)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Load transactions on component mount
    onMounted(() => {
      loadTransactions()
    })

    return {
      transactions,
      loading,
      error,
      selectedAssetType,
      selectedAction,
      limit,
      filteredTransactions,
      loadTransactions,
      loadMore,
      formatCurrency,
      formatDate
    }
  }
}
</script>

<style scoped>
.transaction-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.subtitle {
  color: #6b7280;
  font-size: 16px;
}

.filters-section {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  min-width: 120px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 60px 20px;
  color: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transaction-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #d1d5db;
  transition: all 0.2s ease;
}

.transaction-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.transaction-card.buy {
  border-left-color: #10b981;
}

.transaction-card.sell {
  border-left-color: #ef4444;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.transaction-type {
  display: flex;
  gap: 8px;
}

.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.type-badge.stock {
  background: #dbeafe;
  color: #1e40af;
}

.type-badge.fund {
  background: #fef3c7;
  color: #92400e;
}

.action-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.action-badge.buy {
  background: #dcfce7;
  color: #166534;
}

.action-badge.sell {
  background: #fee2e2;
  color: #991b1b;
}

.transaction-date {
  color: #6b7280;
  font-size: 14px;
}

.transaction-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticker-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.quantity {
  color: #6b7280;
  font-size: 14px;
}

.price-info {
  text-align: right;
}

.price {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.total {
  color: #6b7280;
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

@media (max-width: 768px) {
  .transaction-page {
    padding: 16px;
  }
  
  .filters-section {
    flex-direction: column;
    gap: 16px;
  }
  
  .transaction-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .price-info {
    text-align: left;
  }
}
</style> 