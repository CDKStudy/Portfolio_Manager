<template>
  <div class="cash-app">
    <!-- Header -->
    <header class="cash-header">
      <h1>
        <svg class="header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Cash Management
      </h1>
      <p>Manage your cash balance and transactions</p>
    </header>

    <!-- Cash Balance Card -->
    <div class="cash-balance-card">
      <div class="balance-info">
        <div class="balance-label">Current Cash Balance</div>
        <div class="balance-amount">${{ formatCurrency(cashBalance) }}</div>
        <div class="balance-subtitle">Available for trading</div>
      </div>
      <div class="balance-actions">
        <button @click="showDepositModal = true" class="btn btn-success">
          + Deposit
        </button>
        <button @click="showWithdrawModal = true" class="btn btn-outline">
          - Withdraw
        </button>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h3>Quick Actions</h3>
      <div class="action-buttons">
        <button @click="quickDeposit(100)" class="action-btn">
          +$100
        </button>
        <button @click="quickDeposit(500)" class="action-btn">
          +$500
        </button>
        <button @click="quickDeposit(1000)" class="action-btn">
          +$1,000
        </button>
        <button @click="quickWithdraw(100)" class="action-btn withdraw">
          -$100
        </button>
        <button @click="quickWithdraw(500)" class="action-btn withdraw">
          -$500
        </button>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="transactions-section">
      <h3>Recent Cash Transactions</h3>
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading transactions...</p>
      </div>
      <div v-else-if="transactions.length === 0" class="empty-state">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <p>No cash transactions yet</p>
      </div>
      <div v-else class="transactions-list">
        <div 
          v-for="transaction in transactions" 
          :key="transaction.id"
          class="transaction-item"
        >
          <div class="transaction-info">
            <div class="transaction-type" :class="transaction.type">
              <svg v-if="transaction.type === 'deposit'" class="transaction-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
              <svg v-else class="transaction-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
              {{ transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal' }}
            </div>
            <div class="transaction-date">{{ formatDate(transaction.timestamp) }}</div>
          </div>
          <div class="transaction-amount" :class="transaction.type">
            {{ transaction.type === 'deposit' ? '+' : '-' }}${{ formatCurrency(transaction.amount) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Deposit Modal -->
    <div v-if="showDepositModal" class="modal-overlay" @click="showDepositModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>
            <svg class="modal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Deposit Cash
          </h3>
          <button @click="showDepositModal = false" class="close-btn">×</button>
        </div>
        <form @submit.prevent="depositCash" class="modal-form">
          <div class="form-group">
            <label>Amount to Deposit</label>
            <input
              v-model.number="depositForm.amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="Enter amount"
              class="form-input"
            />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showDepositModal = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-success">
              Deposit
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Withdraw Modal -->
    <div v-if="showWithdrawModal" class="modal-overlay" @click="showWithdrawModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>💸 Withdraw Cash</h3>
          <button @click="showWithdrawModal = false" class="close-btn">×</button>
        </div>
        <form @submit.prevent="withdrawCash" class="modal-form">
          <div class="form-group">
            <label>Amount to Withdraw</label>
            <input
              v-model.number="withdrawForm.amount"
              type="number"
              min="0.01"
              step="0.01"
              max="cashBalance"
              required
              placeholder="Enter amount"
              class="form-input"
            />
            <small class="form-help">Maximum: ${{ formatCurrency(cashBalance) }}</small>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showWithdrawModal = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="loading || withdrawForm.amount > cashBalance" class="btn btn-outline">
              {{ loading ? 'Processing...' : 'Withdraw' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" class="message-toast" :class="messageType">
      <span>{{ message }}</span>
      <button @click="message = ''" class="close-btn">×</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { portfolioAPI } from '../services/api';

export default {
  name: 'Cash',
  setup() {
    const cashBalance = ref(0);
    const transactions = ref([]);
    const loading = ref(false);
    const message = ref('');
    const messageType = ref('success');
    
    const showDepositModal = ref(false);
    const showWithdrawModal = ref(false);
    
    const depositForm = ref({
      amount: 0
    });
    
    const withdrawForm = ref({
      amount: 0
    });

    // Load cash balance
    const loadCashBalance = async () => {
      try {
        const response = await portfolioAPI.getCashBalance();
        cashBalance.value = response.data.cash;
      } catch (error) {
        console.error('Error loading cash balance:', error);
        message.value = 'Failed to load cash balance';
        messageType.value = 'error';
      }
    };

    // Load cash transactions
    const loadCashTransactions = async () => {
      try {
        const response = await portfolioAPI.getCashTransactions();
        transactions.value = response.data.transactions.map(t => ({
          id: t.id,
          type: t.action === 'buy' ? 'deposit' : 'withdraw',
          amount: t.quantity,
          timestamp: new Date(t.timestamp)
        }));
      } catch (error) {
        console.error('Error loading cash transactions:', error);
        message.value = 'Failed to load transactions';
        messageType.value = 'error';
      }
    };

    // Deposit cash
    const depositCash = async () => {
      if (!depositForm.value.amount || depositForm.value.amount <= 0) {
        message.value = 'Please enter a valid amount';
        messageType.value = 'error';
        return;
      }

      loading.value = true;
      try {
        const response = await portfolioAPI.depositCash(depositForm.value.amount);
        cashBalance.value = response.data.newBalance;
        message.value = response.data.message;
        messageType.value = 'success';
        
        // Reset form
        depositForm.value.amount = 0;
        showDepositModal.value = false;
        
        // Reload transactions
        await loadCashTransactions();
      } catch (error) {
        console.error('Error depositing cash:', error);
        message.value = error.response?.data?.error || 'Failed to deposit cash';
        messageType.value = 'error';
      } finally {
        loading.value = false;
      }
    };

    // Withdraw cash
    const withdrawCash = async () => {
      if (!withdrawForm.value.amount || withdrawForm.value.amount <= 0) {
        message.value = 'Please enter a valid amount';
        messageType.value = 'error';
        return;
      }

      if (withdrawForm.value.amount > cashBalance.value) {
        message.value = 'Insufficient cash balance';
        messageType.value = 'error';
        return;
      }

      loading.value = true;
      try {
        const response = await portfolioAPI.withdrawCash(withdrawForm.value.amount);
        cashBalance.value = response.data.newBalance;
        message.value = response.data.message;
        messageType.value = 'success';
        
        // Reset form
        withdrawForm.value.amount = 0;
        showWithdrawModal.value = false;
        
        // Reload transactions
        await loadCashTransactions();
      } catch (error) {
        console.error('Error withdrawing cash:', error);
        message.value = error.response?.data?.error || 'Failed to withdraw cash';
        messageType.value = 'error';
      } finally {
        loading.value = false;
      }
    };

    // Quick actions
    const quickDeposit = (amount) => {
      depositForm.value.amount = amount;
      showDepositModal.value = true;
    };

    const quickWithdraw = (amount) => {
      withdrawForm.value.amount = amount;
      showWithdrawModal.value = true;
    };

    // Utility functions
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    onMounted(() => {
      loadCashBalance();
      loadCashTransactions();
    });

    return {
      cashBalance,
      transactions,
      loading,
      message,
      messageType,
      showDepositModal,
      showWithdrawModal,
      depositForm,
      withdrawForm,
      depositCash,
      withdrawCash,
      quickDeposit,
      quickWithdraw,
      formatCurrency,
      formatDate
    };
  }
};
</script>

<style scoped>
.cash-app {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.cash-header {
  text-align: center;
  margin-bottom: 2rem;
}

.cash-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.cash-header p {
  color: #6b7280;
  font-size: 1.1rem;
}

.cash-balance-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-info {
  flex: 1;
}

.balance-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.balance-amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.balance-subtitle {
  font-size: 0.875rem;
  color: #10b981;
  font-weight: 500;
}

.balance-actions {
  display: flex;
  gap: 1rem;
}

.quick-actions {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  margin-bottom: 2rem;
}

.quick-actions h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.action-btn.withdraw {
  color: #dc2626;
  border-color: #fecaca;
}

.action-btn.withdraw:hover {
  background: #fef2f2;
  border-color: #f87171;
}

.transactions-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.transactions-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
}

.transaction-info {
  flex: 1;
}

.transaction-type {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.transaction-type.deposit {
  color: #10b981;
}

.transaction-type.withdraw {
  color: #dc2626;
}

.transaction-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.transaction-amount {
  font-weight: 600;
  font-size: 1.125rem;
}

.transaction-amount.deposit {
  color: #10b981;
}

.transaction-amount.withdraw {
  color: #dc2626;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: #6b7280;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  color: #6b7280;
}

.header-icon {
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.5rem;
  display: inline-block;
  vertical-align: middle;
}

.transaction-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
  display: inline-block;
  vertical-align: middle;
}

.modal-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  display: inline-block;
  vertical-align: middle;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-outline {
  background: transparent;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

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
  padding: 1.5rem 1.5rem 0;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-form {
  padding: 0 1.5rem 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-help {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.message-toast {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 400px;
}

.message-toast.success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.message-toast.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

@media (max-width: 768px) {
  .cash-app {
    padding: 1rem;
  }
  
  .cash-balance-card {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .balance-actions {
    width: 100%;
    justify-content: center;
  }
  
  .action-buttons {
    justify-content: center;
  }
}
</style> 