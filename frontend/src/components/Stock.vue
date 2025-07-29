<template>
  <div class="stock-page">
    <!-- Stock Management -->
    <div class="asset-management">
      <div class="asset-header">
        <h2>Stock Trading</h2>
        <button @click="showBuyModal = true" class="btn btn-primary">
          + Buy Stock
        </button>
      </div>
      
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading stocks...</p>
      </div>
      <div v-else-if="stockHoldings.length === 0" class="empty-state">
        <div class="empty-icon">📈</div>
        <p>No stocks in your portfolio</p>
        <p class="empty-subtitle">Start by buying your first stock!</p>
      </div>
      <div v-else class="holdings-grid">
        <div
          v-for="holding in stockHoldings"
          :key="holding.id"
          class="holding-card"
        >
          <div class="holding-header">
            <div class="stock-info">
              <h4>{{ holding.ticker }}</h4>
              <span class="stock-volume">{{ holding.quantity }} shares</span>
            </div>
            <div class="holding-actions">
              <button @click="sellAsset(holding)" class="btn btn-outline btn-sm">
                Sell
              </button>
              <!-- <button @click="deleteHolding(holding.id)" class="btn btn-danger btn-sm">
                ×
              </button> -->
            </div>
          </div>
          
          <div class="holding-details">
            <div class="price-row">
              <span class="current-price">${{ formatCurrency(holding.currentPrice || holding.buyPrice) }}</span>
              <span class="price-change" :class="{ positive: (holding.profitLoss || 0) >= 0, negative: (holding.profitLoss || 0) < 0 }">
                {{ (holding.profitLoss || 0) >= 0 ? '+' : '' }}${{ formatCurrency(holding.profitLoss || 0) }}
              </span>
            </div>
            
            <div class="value-row">
              <span class="total-value">Total: ${{ formatCurrency(holding.totalValue || (holding.quantity * (holding.currentPrice || holding.buyPrice))) }}</span>
              <span class="return-percent" :class="{ positive: (holding.profitLossPercent || 0) >= 0, negative: (holding.profitLossPercent || 0) < 0 }">
                {{ (holding.profitLossPercent || 0) >= 0 ? '+' : '' }}{{ formatPercent(holding.profitLossPercent || 0) }}%
              </span>
            </div>
            
            <div class="cost-row">
              <span class="avg-cost">Avg Cost: ${{ formatCurrency(holding.buyPrice) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Market Watch -->
    <div class="market-watch-section">
      <div class="market-watch-card">
        <h3>Stock Market Watch</h3>
        <div class="market-list">
          <div 
            v-for="stock in marketStocks" 
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

    <!-- Predict -->
    <div class="prediction-section">
      <h3>Stock Predictions</h3>
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading predictions...</p>
      </div>
      <div v-else-if="predictions.length === 0" class="empty-state">
        <p>No predictions available.</p>
      </div>
      <div v-else class="prediction-list">
        <div 
          v-for="prediction in predictions" 
          :key="prediction.ticker" 
          class="prediction-item"
        >
          <div class="prediction-symbol">{{ prediction.ticker }}</div>
          <div class="prediction-price">Predicted Price: ${{ formatCurrency(prediction.predictedPrice) }}</div>
        </div>
      </div>
    </div>

    <!-- Buy Stock Modal -->
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
              v-model="buyForm.ticker"
              type="text"
              placeholder="e.g., AAPL"
              required
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Number of Shares</label>
            <input
              v-model.number="buyForm.quantity"
              type="number"
              min="1"
              step="0.0001"
              required
              placeholder="Enter shares"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Price per Share (optional)</label>
            <input
              v-model.number="buyForm.price"
              type="number"
              step="0.0001"
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
        <div class="modal-header">
          <h3>Sell Stock</h3>
          <button @click="showSellModal = false" class="close-btn">×</button>
        </div>
        <form @submit.prevent="sellStockConfirm" class="modal-form">
          <div class="form-group">
            <label>Stock: {{ sellingAsset?.ticker }}</label>
          </div>
          <div class="form-group">
            <label>Available Shares: {{ sellingAsset?.quantity }}</label>
          </div>
          <div class="form-group">
            <label>Number of Shares to Sell:</label>
            <input
              v-model.number="sellForm.quantity"
              type="number"
              :max="sellingAsset?.quantity"
              min="0.0001"
              step="0.0001"
              required
              placeholder="Enter shares"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Price per Share (optional):</label>
            <input
              v-model.number="sellForm.price"
              type="number"
              step="0.0001"
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

    <!-- Error Message -->
    <div v-if="error" class="error-toast">
      <span>{{ error }}</span>
      <button @click="error = ''" class="close-btn">×</button>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { portfolioAPI, stockAPI } from '../services/api';
import axios from 'axios';

export default {
  name: 'Stock',
  setup() {
    const loading = ref(false);
    const error = ref('');
    const stockHoldings = ref([]);
    //Empty array for market stocks
    const marketStocks = ref([]);
    const predictions = ref([]);  // prediction data
    // const marketStocks = ref([
    //   { ticker: 'AAPL', price: 213.88, change: 1.28, changePercent: 0.06 },
    //   { ticker: 'MSFT', price: 513.71, change: 2.82, changePercent: 0.55 },
    //   { ticker: 'GOOGL', price: 193.18, change: 1.02, changePercent: 0.53 },
    //   { ticker: 'AMZN', price: 231.44, change: -0.79, changePercent: -0.34 },
    //   { ticker: 'TSLA', price: 316.06, change: 11.11, changePercent: 3.52 },
    //   { ticker: 'META', price: 712.68, change: -2.14, changePercent: -0.30 },
    //   { ticker: 'NVDA', price: 142.25, change: 3.15, changePercent: 2.27 },
    //   { ticker: 'NFLX', price: 685.34, change: -5.22, changePercent: -0.76 }
    // ]);
    const showBuyModal = ref(false);
    const showSellModal = ref(false);
    const sellingAsset = ref(null);
    
    const buyForm = ref({
      ticker: '',
      quantity: 1,
      price: null
    });
    
    const sellForm = ref({
      quantity: 1,
      price: null
    });

    // Load stock holdings
    const loadStockHoldings = async () => {
      loading.value = true;
      try {
        const holdingsResponse = await portfolioAPI.getHoldings();
        const allHoldings = holdingsResponse.data.holdings || [];
        stockHoldings.value = allHoldings.filter(h => h.type === 'stock');
      } catch (err) {
        error.value = 'Failed to load stock holdings';
        console.error('Error loading stock holdings:', err);
      } finally {
        loading.value = false;
      }
    };

    // 加载预测数据
    const loadPredictions = async () => {
      loading.value = true;
      try {
        const response = await axios.get('/api/predict');  // 请求后端的预测数据
        predictions.value = response.data.predictions || [];  // 将预测数据保存到 predictions
      } catch (err) {
        console.error('Error fetching predictions:', err);
      } finally {
        loading.value = false;
      }
    };

    // NEW ADD
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

    // Buy stock function
    const buyStock = async () => {
      if (!buyForm.value.ticker || !buyForm.value.quantity) {
        error.value = 'Please fill in all required fields';
        return;
      }

      loading.value = true;
      error.value = '';
      try {
        const response = await stockAPI.buyStock(
          buyForm.value.ticker,
          buyForm.value.quantity,
          buyForm.value.price
        );

        // Reset form
        buyForm.value = {
          ticker: '',
          quantity: 1,
          price: null
        };
        showBuyModal.value = false;
        
        // Reload data
        await loadStockHoldings();
        
        // Show success message
        error.value = '';
      } catch (err) {
        error.value = err.response?.data?.error || 'Failed to buy stock';
        console.error('Error buying stock:', err);
      } finally {
        loading.value = false;
      }
    };

    // Sell stock function
    const sellAsset = (asset) => {
      sellingAsset.value = asset;
      sellForm.value = {
        quantity: 1,
        price: null
      };
      showSellModal.value = true;
    };

    const sellStockConfirm = async () => {
      if (!sellingAsset.value || !sellForm.value.quantity) {
        error.value = 'Please fill in all required fields';
        return;
      }

      if (sellForm.value.quantity > sellingAsset.value.quantity) {
        error.value = 'Cannot sell more than you own';
        return;
      }

      loading.value = true;
      error.value = '';
      try {
        const response = await stockAPI.sellStock(
          sellingAsset.value.ticker,
          sellForm.value.quantity,
          sellForm.value.price
        );

        // Reset form
        sellForm.value = {
          quantity: 1,
          price: null
        };
        sellingAsset.value = null;
        showSellModal.value = false;
        
        // Reload data
        await loadStockHoldings();
        
        // Show success message
        error.value = '';
      } catch (err) {
        error.value = err.response?.data?.error || 'Failed to sell stock';
        console.error('Error selling stock:', err);
      } finally {
        loading.value = false;
      }
    };

    // Delete holding
    const deleteHolding = async (id) => {
      if (!confirm('Are you sure you want to delete this holding?')) {
        return;
      }

      loading.value = true;
      error.value = '';
      try {
        await portfolioAPI.deleteHolding(id);
        await loadStockHoldings();
      } catch (err) {
        error.value = 'Failed to delete holding';
        console.error('Error deleting holding:', err);
      } finally {
        loading.value = false;
      }
    };

    // Select stock from market watch
    const selectStock = (ticker) => {
      buyForm.value.ticker = ticker;
      showBuyModal.value = true;
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
      loadStockHoldings();
      loadMarketStocks();
      loadPredictions();
    });

    return {
      loading,
      error,
      stockHoldings,
      marketStocks,
      showBuyModal,
      showSellModal,
      sellingAsset,
      buyForm,
      sellForm,
      buyStock,
      sellAsset,
      sellStockConfirm,
      deleteHolding,
      selectStock,
      formatPercent,
      predictions,
      formatCurrency
    };
  }
};
</script>

<style scoped>
.stock-page {
  padding: 24px;
  background: #f9fafb;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

/* Asset Management */
.asset-management {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  height: fit-content;
}

.asset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.asset-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.holdings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.holding-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #f3f4f6;
  transition: all 0.2s ease;
}

.holding-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.holding-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stock-info {
  flex: 1;
}

.stock-info h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.stock-volume {
  font-size: 14px;
  color: #6b7280;
}

.holding-actions {
  display: flex;
  gap: 8px;
}

.holding-details {
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.price-row, .value-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.current-price, .total-value {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
}

.price-change, .return-percent {
  font-size: 14px;
  font-weight: 500;
}

.price-change.positive, .return-percent.positive {
  color: #10b981;
}

.price-change.negative, .return-percent.negative {
  color: #ef4444;
}

.cost-row {
  display: flex;
  justify-content: flex-end;
  font-size: 14px;
  color: #6b7280;
}

.avg-cost {
  font-weight: 500;
}

/* Market Watch Section */
.market-watch-section {
  display: flex;
  flex-direction: column;
}

.market-watch-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  height: fit-content;
}

.market-watch-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
}

.market-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* Limit the height so the list can scroll if there are too many items */
  max-height: 300px;
  /* Enable vertical scrolling when content exceeds the height */
  overflow-y: auto;
  /* Add padding to the right to prevent scroll bar from overlapping content */
  padding-right: 4px;
}

/* Optional: Custom scrollbar style for WebKit browsers */
.market-list::-webkit-scrollbar {
  width: 6px; /* Scrollbar width */
}

.market-list::-webkit-scrollbar-thumb {
  background-color: #d1d5db; /* Scrollbar thumb color */
  border-radius: 4px;        /* Rounded scrollbar thumb */
}

.market-list::-webkit-scrollbar-track {
  background-color: transparent; /* Background of the scrollbar track */
}

.market-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.market-item:hover {
  background: #f9fafb;
  transform: translateY(-1px);
}

.market-symbol {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
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
.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
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
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-subtitle {
  font-size: 14px;
  margin-top: 8px;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 8px;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover {
  background: #5856eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-outline {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal Styles */
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
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 0;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 24px 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #374151;
  background: #f3f4f6;
}

.modal-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
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
  margin-top: 8px;
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

.prediction-section {
  margin-top: 32px;
}

.prediction-list {
  list-style-type: none;
  padding: 0;
}

.prediction-item {
  background: #f9fafb;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
}

.prediction-symbol {
  font-weight: 600;
}

.prediction-price {
  font-size: 16px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .stock-page {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .holdings-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .stock-page {
    padding: 16px;
  }
  
  .holdings-grid {
    grid-template-columns: 1fr;
  }
  
  .asset-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style> 