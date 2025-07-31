<template>
  <div class="fund-page">
    <!-- Fund Management -->
    <div class="asset-management" ref="fundTradingCard">
      <div class="asset-header">
        <h2>Fund Trading</h2>
        <button @click="showBuyModal = true" class="btn btn-primary">
          + Buy Fund
        </button>
      </div>
      
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading funds...</p>
      </div>
      <div v-else-if="fundHoldings.length === 0" class="empty-state">
        <div class="empty-icon">🏛️</div>
        <p>No funds in your portfolio</p>
        <p class="empty-subtitle">Start by buying your first fund!</p>
      </div>
      <div v-else class="holdings-grid">
        <div
          v-for="holding in fundHoldings"
          :key="holding.id"
          class="holding-card"
        >
          <div class="holding-header">
            <div class="fund-info">
              <h4>{{ holding.ticker }}</h4>
              <span class="fund-volume">{{ holding.quantity }} units</span>
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
              <span class="current-price">Current Market Price (per unit)：${{ formatCurrency(holding.currentPrice || holding.buyPrice) }}</span>
              <span class="price-change" :class="{ positive: (holding.profitLoss || 0) >= 0, negative: (holding.profitLoss || 0) < 0 }">
                {{ (holding.profitLoss || 0) >= 0 ? '+' : '' }}${{ formatCurrency(holding.profitLoss || 0) }}
              </span>
            </div>
            <!-- total -->
            <div class="value-row">
              <span class="total-value">Current Market Value (Total): ${{ formatCurrency(holding.totalValue || (holding.quantity * (holding.currentPrice || holding.buyPrice))) }}</span>
              <span class="return-percent" :class="{ positive: (holding.profitLossPercent || 0) >= 0, negative: (holding.profitLossPercent || 0) < 0 }">
                {{ (holding.profitLossPercent || 0) >= 0 ? '+' : '' }}{{ formatPercent(holding.profitLossPercent || 0) }}%
              </span>
            </div>
            <!-- Avg Cost -->
            <div class="cost-row">
              <span class="avg-cost">Average Purchase Cost: ${{ formatCurrency(holding.buyPrice) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fund Market Watch -->
    <div class="market-watch-section">
      <div class="market-watch-card" ref="marketWatchCard">
        <h3>Fund Market Watch</h3>
        <div class="market-list">
          <div 
            v-for="fund in marketFunds" 
            :key="fund.ticker"
            class="market-item"
            @click="selectFund(fund.ticker)"
          >
            <div class="market-symbol">{{ fund.ticker }}</div>
            <div class="market-price">${{ formatCurrency(fund.price) }}</div>
            <div class="market-change" :class="{ positive: fund.change >= 0, negative: fund.change < 0 }">
              {{ fund.change >= 0 ? '+' : '' }}{{ formatPercent(fund.changePercent) }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Buy Fund Modal -->
    <div v-if="showBuyModal" class="modal-overlay" @click="showBuyModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Buy Fund</h3>
          <button @click="showBuyModal = false" class="close-btn">×</button>
        </div>
        <form @submit.prevent="buyFund" class="modal-form">
          <div class="form-group">
            <label>Fund Symbol</label>
            <input
              v-model="buyForm.ticker"
              type="text"
              placeholder="e.g., 510300.SS"
              required
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Number of Units</label>
            <input
              v-model.number="buyForm.quantity"
              type="number"
              min="1"
              step="0.0001"
              required
              placeholder="Enter units"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Price per Unit (optional)</label>
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
              {{ loading ? 'Buying...' : 'Buy Fund' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Sell Fund Modal -->
    <div v-if="showSellModal" class="modal-overlay" @click="showSellModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Sell Fund</h3>
          <button @click="showSellModal = false" class="close-btn">×</button>
        </div>
        <form @submit.prevent="sellFundConfirm" class="modal-form">
          <div class="form-group">
            <label>Fund: {{ sellingAsset?.ticker }}</label>
          </div>
          <div class="form-group">
            <label>Available Units: {{ sellingAsset?.quantity }}</label>
          </div>
          <div class="form-group">
            <label>Number of Units to Sell:</label>
            <input
              v-model.number="sellForm.quantity"
              type="number"
              :max="sellingAsset?.quantity"
              min="0.0001"
              step="0.0001"
              required
              placeholder="Enter units"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Price per Unit (optional):</label>
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
              {{ loading ? 'Selling...' : 'Sell Fund' }}
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
import { nextTick, onMounted, ref, watch } from 'vue';
import { fundAPI, portfolioAPI } from '../services/api';

export default {
  name: 'Fund',
  setup() {
    const loading = ref(false);
    const error = ref('');
    const fundHoldings = ref([]);
    const marketFunds = ref([]);
    // const marketFunds = ref([
    //   { ticker: '510300', price: 3.52, change: 0.02, changePercent: 0.57 },
    //   { ticker: '510500', price: 5.18, change: 0.05, changePercent: 0.97 },
    //   { ticker: '159915', price: 1.045, change: -0.003, changePercent: -0.29 },
    //   { ticker: '159919', price: 4.234, change: 0.021, changePercent: 0.50 },
    //   { ticker: '512100', price: 1.632, change: -0.012, changePercent: -0.73 },
    //   { ticker: '515050', price: 1.089, change: 0.008, changePercent: 0.74 },
    //   { ticker: '516160', price: 0.892, change: 0.015, changePercent: 1.71 },
    //   { ticker: '588000', price: 4.567, change: -0.033, changePercent: -0.72 }
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

    // Refs for height synchronization
    const fundTradingCard = ref(null);
    const marketWatchCard = ref(null);

    // Function to sync market watch height with fund trading card
    const syncMarketWatchHeight = () => {
      if (fundTradingCard.value && marketWatchCard.value) {
        const fundHeight = fundTradingCard.value.offsetHeight;
        marketWatchCard.value.style.height = `${fundHeight}px`;
      }
    };

    // Load fund holdings
    const loadFundHoldings = async () => {
      loading.value = true;
      try {
        const holdingsResponse = await portfolioAPI.getHoldings();
        const allHoldings = holdingsResponse.data.holdings || [];
        fundHoldings.value = allHoldings.filter(h => h.type === 'fund');
      } catch (err) {
        error.value = 'Failed to load fund holdings';
        console.error('Error loading fund holdings:', err);
      } finally {
        loading.value = false;
      }
    };

    // Buy fund function
    const buyFund = async () => {
      if (!buyForm.value.ticker || !buyForm.value.quantity) {
        error.value = 'Please fill in all required fields';
        return;
      }

      loading.value = true;
      error.value = '';
      try {
        const response = await fundAPI.buyFund(
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
        await loadFundHoldings();
        
        // Show success message
        error.value = '';
      } catch (err) {
        error.value = err.response?.data?.error || 'Failed to buy fund';
        console.error('Error adding fund:', err);
      } finally {
        loading.value = false;
      }
    };

    // Sell fund function
    const sellAsset = (asset) => {
      sellingAsset.value = asset;
      sellForm.value = {
        quantity: 1,
        price: null
      };
      showSellModal.value = true;
    };

    const sellFundConfirm = async () => {
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
        const response = await fundAPI.sellFund(
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
        await loadFundHoldings();
        
        // Show success message
        error.value = '';
      } catch (err) {
        error.value = err.response?.data?.error || 'Failed to sell fund';
        console.error('Error selling fund:', err);
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
        await loadFundHoldings();
      } catch (err) {
        error.value = 'Failed to delete holding';
        console.error('Error deleting holding:', err);
      } finally {
        loading.value = false;
      }
    };

    // Load real-time market watch data
    const loadMarketFund = async () => {
      try {
        const res = await fundAPI.getMarketWatch();
        marketFunds.value = res.data.stocks;
      } catch (err) {
        error.value = 'Failed to load market data';
        console.error('Error loading market stocks:', err);
      }
    };

    // Select fund from market watch
    const selectFund = (ticker) => {
      buyForm.value.ticker = ticker;
      showBuyModal.value = true;
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      }).format(value);
    };

    const formatPercent = (value) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    };

    onMounted(() => {
      loadFundHoldings();
      loadMarketFund();

      // Sync market watch height with fund trading card
      nextTick(() => {
        syncMarketWatchHeight();
      });
    });

    // Watch for changes in fundHoldings to resync height
    watch(fundHoldings, () => {
      nextTick(() => {
        syncMarketWatchHeight();
      });
    }, { deep: true });

    return {
      loading,
      error,
      fundHoldings,
      marketFunds,
      showBuyModal,
      showSellModal,
      sellingAsset,
      buyForm,
      sellForm,
      buyFund,
      sellAsset,
      sellFundConfirm,
      deleteHolding,
      selectFund,
      formatCurrency,
      formatPercent,
      fundTradingCard,
      marketWatchCard,
      syncMarketWatchHeight
    };
  }
};
</script>

<style scoped>
.fund-page {
  padding: 24px;
  background: #f9fafb;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: start;
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
  background: #fef3c7;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #fbbf24;
  transition: all 0.2s ease;
}

.holding-card:hover {
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
  transform: translateY(-2px);
}

.holding-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.fund-info {
  flex: 1;
}

.fund-info h4 {
  font-size: 18px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 4px;
}

.fund-volume {
  font-size: 14px;
  color: #b45309;
}

.holding-actions {
  display: flex;
  gap: 8px;
}

.holding-details {
  padding-top: 16px;
  border-top: 1px solid #fbbf24;
}

.price-row, .value-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.current-price, .total-value {
  font-weight: 600;
  color: #92400e;
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
  color: #b45309;
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
  display: flex;
  flex-direction: column;
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
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

/* Optional: Customize scrollbar (for modern browsers) */
.market-list::-webkit-scrollbar {
  width: 6px;
}

.market-list::-webkit-scrollbar-thumb {
  background-color: #fbbf24;
  border-radius: 6px;
}

.market-list::-webkit-scrollbar-track {
  background-color: transparent;
}


.market-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  background: #fef3c7;
  border: 1px solid #fbbf24;
}

.market-item:hover {
  background: #fde68a;
  transform: translateY(-1px);
}

.market-symbol {
  font-weight: 600;
  color: #92400e;
  font-size: 16px;
}

.market-price {
  font-weight: 500;
  color: #92400e;
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
  border-top: 4px solid #fbbf24;
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
  background: #fbbf24;
  color: #92400e;
}

.btn-primary:hover {
  background: #f59e0b;
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
  border: 1px solid #fbbf24;
  color: #92400e;
}

.btn-outline:hover {
  background: #fef3c7;
  border-color: #f59e0b;
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
  border-color: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
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

/* Responsive Design */
@media (max-width: 1024px) {
  .fund-page {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .holdings-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .fund-page {
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