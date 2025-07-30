<template>
  <div class="stock-page">
    <!-- Main content area -->
    <div class="main-content">
      <!-- Stock Management -->
      <div class="asset-management" ref="stockTradingCard">
        <div class="asset-header">
          <h2>Stock Trading</h2>
          <button @click="showBuyModal = true" class="btn btn-primary">
            + Add Stock Record
          </button>
        </div>
        
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading stocks...</p>
        </div>
        <div v-else-if="stockHoldings.length === 0" class="empty-state">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
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
                <span class="current-price">Current Market Price (per unit)：${{ formatCurrency(holding.currentPrice || holding.buyPrice) }}</span>
                <span class="price-change" :class="{ positive: (holding.profitLoss || 0) >= 0, negative: (holding.profitLoss || 0) < 0 }">
                  {{ (holding.profitLoss || 0) >= 0 ? '+' : '' }}${{ formatCurrency(holding.profitLoss || 0) }}
                </span>
              </div>
              
              <div class="value-row">
                <span class="total-value">Current Market Value (Total): ${{ formatCurrency(holding.totalValue || (holding.quantity * (holding.currentPrice || holding.buyPrice))) }}</span>
                <span class="return-percent" :class="{ positive: (holding.profitLossPercent || 0) >= 0, negative: (holding.profitLossPercent || 0) < 0 }">
                  {{ (holding.profitLossPercent || 0) >= 0 ? '+' : '' }}{{ formatPercent(holding.profitLossPercent || 0) }}%
                </span>
              </div>
              
              <div class="cost-row">
                <span class="avg-cost">Average Purchase Cost: ${{ formatCurrency(holding.buyPrice) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Market Watch -->
      <div class="market-watch-section">
        <div class="market-watch-card" ref="marketWatchCard">
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
    </div>

    <!-- Predict -->
    <div class="prediction-section">
      <div class="prediction-header">
        <h3>AI Stock Predictions</h3>
        <div class="prediction-controls">
          <button 
            @click="startNewPrediction" 
            :disabled="predictionState.isTraining" 
            class="btn btn-primary btn-sm"
          >
            {{ predictionState.isTraining ? 'Training Models...' : 'Generate New Predictions' }}
          </button>
          <!-- <div v-if="predictionState.isTraining && trainingTime" class="training-time">
            {{ trainingTime }}
          </div> -->
        </div>
      </div>
      
      <!-- Task History -->
      <div class="task-history">
        <h4>Prediction History</h4>
        <div v-if="tasks.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p>No prediction tasks yet</p>
          <p class="empty-subtitle">Generate your first AI prediction above</p>
        </div>
        <div v-else class="task-list">
          <div 
            v-for="task in tasks" 
            :key="task.id"
            class="task-item"
            :class="{ 'task-active': selectedTaskId === task.id }"
            @click="selectTask(task)"
          >
            <div class="task-info">
              <div class="task-name">{{ task.task_name }}</div>
              <div class="task-date">{{ formatDate(task.created_at) }}</div>
            </div>
            <div class="task-status">
              <span class="status-badge" :class="task.status">
                <span v-if="task.status === 'training'" class="status-spinner"></span>
                {{ getStatusText(task.status) }}
              </span>
              <button 
                v-if="task.status === 'completed'" 
                @click.stop="viewTaskResults(task.id)"
                class="btn btn-outline btn-xs"
              >
                View Results
              </button>
            </div>
          </div>
        </div>
      </div>
      

      
      <!-- Training Progress -->
      <div v-if="predictionState.isTraining" class="training-progress-section">
        <div class="training-header">
          <h4>Training in Progress</h4>
          <!-- <div class="training-time">{{ trainingTime }}</div> -->
        </div>
        <div class="training-details">
          <p>🧠 Analyzing market patterns and training LSTM neural networks...</p>
          <p>⏱️ This process typically takes 2-5 minutes</p>
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

    <!-- Results Modal -->
    <div v-if="showResultsModal && selectedTask && selectedTask.status === 'completed' && selectedTask.results" class="modal-overlay" @click="showResultsModal = false">
      <div class="modal results-modal" @click.stop>
        <div class="modal-header">
          <h3>Prediction Results - {{ selectedTask.task_name }}</h3>
          <button @click="showResultsModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-content">
          <div class="prediction-list">
            <div 
              v-for="prediction in selectedTask.results.predictions" 
              :key="prediction.ticker" 
              class="prediction-item"
            >
              <div class="prediction-info">
                <div class="prediction-symbol">{{ prediction.ticker }}</div>
                <div class="prediction-current">Current: ${{ formatCurrency(prediction.currentPrice) }}</div>
              </div>
              <div class="prediction-price">
                <div class="predicted-price">Predicted: ${{ formatCurrency(prediction.predictedPrice) }}</div>
                <div class="prediction-change" :class="{ positive: prediction.predictedPrice > prediction.currentPrice, negative: prediction.predictedPrice < prediction.currentPrice }">
                  {{ prediction.predictedPrice > prediction.currentPrice ? '+' : '' }}{{ formatPercent(((prediction.predictedPrice - prediction.currentPrice) / prediction.currentPrice) * 100) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
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
import { onMounted, onUnmounted, ref, computed, nextTick, watch } from 'vue';
import { portfolioAPI, stockAPI, predictionAPI } from '../services/api';

export default {
  name: 'Stock',
  setup() {
    const loading = ref(false);
    const error = ref('');
    const stockHoldings = ref([]);
    //Empty array for market stocks
    const marketStocks = ref([]);
    const tasks = ref([]);  // prediction tasks
    const selectedTask = ref(null);  // selected task for viewing results
    const selectedTaskId = ref(null);
    const predictionState = ref(predictionAPI.getState());  // global prediction state
    const trainingStartTime = ref(null);
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
    const showResultsModal = ref(false);
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
    const stockTradingCard = ref(null);
    const marketWatchCard = ref(null);

    // Function to sync market watch height with stock trading card
    const syncMarketWatchHeight = () => {
      if (stockTradingCard.value && marketWatchCard.value) {
        const stockHeight = stockTradingCard.value.offsetHeight;
        marketWatchCard.value.style.height = `${stockHeight}px`;
      }
    };

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

    // // Computed property for training time display
    // const trainingTime = computed(() => {
    //   if (!predictionState.value.isTraining || !trainingStartTime.value) return null;
    //   const elapsed = Math.floor((Date.now() - trainingStartTime.value) / 1000);
    //   const minutes = Math.floor(elapsed / 60);
    //   const seconds = elapsed % 60;
    //   return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    // });

    // Load all prediction tasks
    const loadTasks = async () => {
      try {
        const response = await predictionAPI.getTasks();
        tasks.value = response.tasks || [];
      } catch (err) {
        console.error('Error loading tasks:', err);
      }
    };

    // Start new prediction
    const startNewPrediction = async () => {
      try {
        trainingStartTime.value = Date.now();
        const response = await predictionAPI.startPrediction();
        
        // Start polling for task completion
        await predictionAPI.pollTaskStatus(response.taskId, (task) => {
          // Update the task in the list
          const index = tasks.value.findIndex(t => t.id === task.id);
          if (index >= 0) {
            tasks.value[index] = task;
          } else {
            tasks.value.unshift(task);
          }
        });
        
        // Reload tasks to get the completed task
        await loadTasks();
      } catch (err) {
        console.error('Error starting prediction:', err);
        error.value = 'Failed to start prediction';
      }
    };

    // Select a task
    const selectTask = (task) => {
      selectedTaskId.value = task.id;
      selectedTask.value = task;
    };

    // View task results
    const viewTaskResults = async (taskId) => {
      try {
        const response = await predictionAPI.getTask(taskId);
        selectedTask.value = response.task;
        selectedTaskId.value = taskId;
        showResultsModal.value = true;
      } catch (err) {
        console.error('Error loading task results:', err);
      }
    };

    // Format date for display
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString();
    };

    // Get status text
    const getStatusText = (status) => {
      switch (status) {
        case 'training': return 'Training';
        case 'completed': return 'Completed';
        case 'failed': return 'Failed';
        default: return status;
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

    // Subscribe to prediction state changes
    let unsubscribe = null;

    onMounted(() => {
      loadStockHoldings();
      loadMarketStocks();
      loadTasks();

      // Subscribe to global prediction state changes
      unsubscribe = predictionAPI.onStateChange((newState) => {
        predictionState.value = { ...newState };
        
        // Update training start time if training started
        if (newState.isTraining && !trainingStartTime.value) {
          trainingStartTime.value = newState.lastTrainingStart;
        }
        
        // Reset training start time when training completes
        if (!newState.isTraining && trainingStartTime.value) {
          trainingStartTime.value = null;
        }
      });

      // Sync market watch height with stock trading card
      nextTick(() => {
        syncMarketWatchHeight();
      });
    });

    // Watch for changes in stockHoldings to resync height
    watch(stockHoldings, () => {
      nextTick(() => {
        syncMarketWatchHeight();
      });
    }, { deep: true });

    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe();
      }
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
      tasks,
      selectedTask,
      selectedTaskId,
      predictionState,
      // trainingTime,
      startNewPrediction,
      selectTask,
      viewTaskResults,
      formatDate,
      getStatusText,
      formatCurrency,
      stockTradingCard,
      marketWatchCard,
      syncMarketWatchHeight,
      showResultsModal
    };
  }
};
</script>

<style scoped>
.stock-page {
  padding: 24px;
  background: #f9fafb;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.main-content {
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
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  color: #6b7280;
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

.results-modal {
  max-width: 700px;
  max-height: 80vh;
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

.modal-content {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
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
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.prediction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.prediction-header h3 {
  margin: 0;
}

.prediction-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.training-time {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #6366f1;
  background: #f0f0ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.new-results-notification {
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-icon {
  font-size: 20px;
}

.notification-content span:nth-child(2) {
  flex: 1;
  font-weight: 500;
}

.training-progress {
  margin-top: 16px;
}

.training-details {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.task-history {
  margin: 32px 0;
}

.task-history h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.task-item.task-active {
  border-color: #6366f1;
  background: #f8faff;
}

.task-info {
  flex: 1;
}

.task-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.task-date {
  font-size: 14px;
  color: #6b7280;
}

.task-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.training {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.completed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.failed {
  background: #fee2e2;
  color: #991b1b;
}

.status-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.btn-xs {
  padding: 4px 8px;
  font-size: 12px;
}

.results-section {
  margin: 32px 0;
}

.results-section h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

.training-progress-section {
  background: #f8faff;
  border: 1px solid #e0e7ff;
  border-radius: 12px;
  padding: 20px;
  margin: 24px 0;
}

.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.training-header h4 {
  margin: 0;
  color: #1f2937;
}

.training-details p {
  margin: 8px 0;
  color: #4b5563;
}

.prediction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.prediction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prediction-item {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.prediction-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.prediction-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.prediction-symbol {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
}

.prediction-current {
  font-size: 14px;
  color: #6b7280;
}

.prediction-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.predicted-price {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
}

.prediction-change {
  font-size: 14px;
  font-weight: 500;
}

.prediction-change.positive {
  color: #10b981;
}

.prediction-change.negative {
  color: #ef4444;
}

.prediction-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.prediction-symbol {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
}

.prediction-current {
  font-size: 14px;
  color: #6b7280;
}

.prediction-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.predicted-price {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
}

.prediction-change {
  font-size: 14px;
  font-weight: 500;
}

.prediction-change.positive {
  color: #10b981;
}

.prediction-change.negative {
  color: #ef4444;
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