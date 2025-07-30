<template>
  <div class="portfolio-app">
    <!-- Sidebar Navigation -->
    <nav class="sidebar">
      <div class="sidebar-header">
        <div class="logo">    
          <span>Portfolio Manager</span>
      </div>
            </div>
      
      <ul class="nav-menu">
        <li class="nav-item active">
          <a href="#" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M8 5a2 2 0 012-2h4a2 2 0 012 2v10a2 2 0 01-2 2H10a2 2 0 01-2-2V5z"/>
            </svg>
            <span>Dashboard</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link" @click="activeTab = 'stocks'">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span>STOCK</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link" @click="activeTab = 'funds'">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <span>FUND</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>CASH</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span>Analytics</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span>Transactions</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span>Reports</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>Settings</span>
          </a>
        </li>
      </ul>
      
      <div class="user-profile-sidebar">
        <div class="user-avatar">
          <span>PZ</span>
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
          <span class="last-updated">Last updated: {{ new Date().toLocaleTimeString() }}</span>
      </div>
    </header>

      <!-- Portfolio Summary Cards -->
      <section class="portfolio-summary">
        <div class="summary-card total-portfolio">
          <div class="card-header">
            <span class="card-title">Total Portfolio Value</span>
            <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        <div class="card-content">
            <div class="card-value">${{ formatCurrency(portfolio.totalValue || 45231.89) }}</div>
            <div class="card-change positive">
              <svg class="change-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              <span>+2.5% from last month</span>
            </div>
        </div>
      </div>
      
        <div class="summary-card stocks">
          <div class="card-header">
            <span class="card-title">Stocks</span>
            <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
        <div class="card-content">
            <div class="card-value">${{ formatCurrency(stockHoldings.totalValue || 28459.00) }}</div>
            <div class="card-change positive">
              <svg class="change-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              <span>+4.3% from last month</span>
            </div>
        </div>
      </div>
      
        <div class="summary-card funds">
          <div class="card-header">
            <span class="card-title">Funds</span>
            <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
        <div class="card-content">
            <div class="card-value">${{ formatCurrency(fundHoldings.totalValue || 12500.00) }}</div>
            <div class="card-change negative">
              <svg class="change-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
              </svg>
              <span>-0.8% from last month</span>
            </div>
        </div>
      </div>
      
        <div class="summary-card cash">
          <div class="card-header">
            <span class="card-title">Cash</span>
            <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        <div class="card-content">
            <div class="card-value">${{ formatCurrency(userInfo.cash || 4272.89) }}</div>
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
        <button class="tab-btn" :class="{ active: activeTab === 'stocks' }" @click="activeTab = 'stocks'">
          Stocks
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'funds' }" @click="activeTab = 'funds'">
          Funds
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
                  + Add Asset
                </button>
              </div>
              
              <div v-if="loading && allHoldings.length === 0" class="loading-state">
                <div class="spinner"></div>
                <p>Loading portfolio...</p>
              </div>
              <div v-else-if="allHoldings.length === 0" class="empty-state">
                <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
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
                  <div class="holding-actions">
                    <button @click="sellAsset(holding)" class="btn btn-sm btn-outline">Sell</button>
                    <button @click="deleteHolding(holding.id)" class="btn btn-sm btn-danger">×</button>
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
                  @click="selectAsset(stock.ticker, 'stock')"
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

        <!-- Stocks Tab -->
        <div v-if="activeTab === 'stocks'" class="tab-panel">
          <div class="asset-management">
            <div class="asset-header">
              <h3>Stock Holdings</h3>
              <button @click="showBuyModal = true; selectedAssetType = 'stock'" class="btn btn-primary">
              + Buy Stock
            </button>
          </div>
          
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Loading stocks...</p>
          </div>
            <div v-else-if="stockHoldings.items.length === 0" class="empty-state">
              <div class="empty-icon">📈</div>
              <p>No stocks in your portfolio</p>
              <p class="empty-subtitle">Start by buying your first stock!</p>
          </div>
          <div v-else class="holdings-grid">
            <div
                v-for="holding in stockHoldings.items"
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
                    <button @click="deleteHolding(holding.id)" class="btn btn-danger btn-sm">
                    ×
                  </button>
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
      </div>

        <!-- Funds Tab -->
        <div v-if="activeTab === 'funds'" class="tab-panel">
          <div class="asset-management">
            <div class="asset-header">
              <h3>Fund Holdings</h3>
              <button @click="showBuyModal = true; selectedAssetType = 'fund'" class="btn btn-primary">
                + Buy Fund
              </button>
          </div>
            
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Loading funds...</p>
            </div>
            <div v-else-if="fundHoldings.items.length === 0" class="empty-state">
              <div class="empty-icon">🏛️</div>
              <p>No funds in your portfolio</p>
              <p class="empty-subtitle">Start by buying your first fund!</p>
            </div>
            <div v-else class="holdings-grid">
              <div
                v-for="holding in fundHoldings.items"
                :key="holding.id"
                class="holding-card"
              >
                <div class="holding-header">
                  <div class="stock-info">
                    <h4>{{ holding.ticker }}</h4>
                    <span class="stock-volume">{{ holding.quantity }} units</span>
              </div>
                  <div class="holding-actions">
                    <button @click="sellAsset(holding)" class="btn btn-outline btn-sm">
                      Sell
                    </button>
                    <button @click="deleteHolding(holding.id)" class="btn btn-danger btn-sm">
                      ×
                    </button>
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

    <!-- Buy Asset Modal -->
    <div v-if="showBuyModal" class="modal-overlay" @click="showBuyModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Buy {{ selectedAssetType === 'fund' ? 'Fund' : 'Stock' }}</h3>
          <button @click="showBuyModal = false" class="close-btn">×</button>
        </div>
        <form @submit.prevent="buyAsset" class="modal-form">
          <div class="form-group">
            <label>Asset Type</label>
            <select v-model="buyForm.assetType" class="form-input" required>
              <option value="stock">Stock</option>
              <option value="fund">Fund</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ buyForm.assetType === 'fund' ? 'Fund' : 'Stock' }} Symbol</label>
            <input
              v-model="buyForm.ticker"
              type="text"
              :placeholder="buyForm.assetType === 'fund' ? 'e.g., 510300' : 'e.g., AAPL'"
              required
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Number of {{ buyForm.assetType === 'fund' ? 'Units' : 'Shares' }}</label>
            <input
              v-model.number="buyForm.quantity"
              type="number"
              min="1"
              step="0.0001"
              required
              :placeholder="`Enter ${buyForm.assetType === 'fund' ? 'units' : 'shares'}`"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Price per {{ buyForm.assetType === 'fund' ? 'Unit' : 'Share' }} (optional)</label>
            <input
              v-model.number="buyForm.price"
              type="number"
              step="0.0001"
              :placeholder="`Leave empty for market price`"
              class="form-input"
            />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showBuyModal = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="loading" class="btn btn-primary">
              {{ loading ? 'Buying...' : `Buy ${buyForm.assetType === 'fund' ? 'Fund' : 'Stock'}` }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Sell Asset Modal -->
    <div v-if="showSellModal" class="modal-overlay" @click="showSellModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Sell {{ sellingAsset?.type === 'fund' ? 'Fund' : 'Stock' }}</h3>
          <button @click="showSellModal = false" class="close-btn">×</button>
        </div>
        <form @submit.prevent="sellAssetConfirm" class="modal-form">
          <div class="form-group">
            <label>{{ sellingAsset?.type === 'fund' ? 'Fund' : 'Stock' }}: {{ sellingAsset?.ticker }}</label>
          </div>
          <div class="form-group">
            <label>Available {{ sellingAsset?.type === 'fund' ? 'Units' : 'Shares' }}: {{ sellingAsset?.quantity }}</label>
          </div>
          <div class="form-group">
            <label>Number of {{ sellingAsset?.type === 'fund' ? 'Units' : 'Shares' }} to Sell:</label>
            <input
              v-model.number="sellForm.quantity"
              type="number"
              :max="sellingAsset?.quantity"
              min="0.0001"
              step="0.0001"
              required
              :placeholder="`Enter ${sellingAsset?.type === 'fund' ? 'units' : 'shares'}`"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Price per {{ sellingAsset?.type === 'fund' ? 'Unit' : 'Share' }} (optional):</label>
            <input
              v-model.number="sellForm.price"
              type="number"
              step="0.0001"
              :placeholder="`Leave empty for market price`"
              class="form-input"
            />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showSellModal = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="loading" class="btn btn-danger">
              {{ loading ? 'Selling...' : `Sell ${sellingAsset?.type === 'fund' ? 'Fund' : 'Stock'}` }}
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
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
import { portfolioAPI, stockAPI, fundAPI } from '../services/api';

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
    const selectedAssetType = ref('stock');
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
    const recentTransactions = ref([]);
    const showBuyModal = ref(false);
    const showSellModal = ref(false);
    const sellingAsset = ref(null);
    
    const buyForm = ref({
      assetType: 'stock',
      ticker: '',
      quantity: 1,
      price: null
    });
    
    const sellForm = ref({
      quantity: 1,
      price: null
    });

    // 图表数据
    const chartData = ref({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Portfolio Value',
          data: [40000, 41200, 43500, 42800, 44500, 46200, 45800, 47500, 48200, 47800, 49500, 45231.89],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
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
          borderColor: '#3b82f6',
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

    // Buy asset function
    const buyAsset = async () => {
      if (!buyForm.value.ticker || !buyForm.value.quantity) {
        error.value = 'Please fill in all required fields';
        return;
      }

      loading.value = true;
      error.value = '';
      try {
        const api = buyForm.value.assetType === 'fund' ? fundAPI : stockAPI;
        const response = await api.buyStock(
          buyForm.value.ticker,
          buyForm.value.quantity,
          buyForm.value.price
        );
        
        // Reset form
        buyForm.value = {
          assetType: 'stock',
          ticker: '',
          quantity: 1,
          price: null
        };
        showBuyModal.value = false;
        
        // Reload data
        await loadPortfolio();
        
        // Show success message
        error.value = '';
      } catch (err) {
        error.value = err.response?.data?.error || 'Failed to buy asset';
        console.error('Error buying asset:', err);
      } finally {
        loading.value = false;
      }
    };

    // Sell asset function
    const sellAsset = (asset) => {
      sellingAsset.value = asset;
      sellForm.value = {
        quantity: 1,
        price: null
      };
      showSellModal.value = true;
    };

    const sellAssetConfirm = async () => {
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
        const api = sellingAsset.value.type === 'fund' ? fundAPI : stockAPI;
        const response = await api.sellStock(
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
        await loadPortfolio();
        
        // Show success message
        error.value = '';
      } catch (err) {
        error.value = err.response?.data?.error || 'Failed to sell asset';
        console.error('Error selling asset:', err);
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
        await loadPortfolio();
      } catch (err) {
        error.value = 'Failed to delete holding';
        console.error('Error deleting holding:', err);
      } finally {
        loading.value = false;
      }
    };

    // Select asset from market watch
    const selectAsset = (ticker, type) => {
      buyForm.value.ticker = ticker;
      buyForm.value.assetType = type;
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
      loadPortfolio();
    });

    return {
      portfolio,
      loading,
      error,
      activeTab,
      selectedAssetType,
      searchQuery,
      searchResults,
      marketStocks,
      userInfo,
      allHoldings,
      stockHoldings,
      fundHoldings,
      recentTransactions,
      showBuyModal,
      showSellModal,
      sellingAsset,
      buyForm,
      sellForm,
      chartData,
      chartOptions,
      performanceChartOptions,
      buyAsset,
      sellAsset,
      sellAssetConfirm,
      deleteHolding,
      selectAsset,
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
  width: 20px;
  height: 20px;
  flex-shrink: 0;
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
  background: #3b82f6;
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
  width: 20px;
  height: 20px;
  flex-shrink: 0;
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
  width: 12px;
  height: 12px;
  flex-shrink: 0;
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
  border-bottom-color: #3b82f6;
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

.holding-type {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
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
  border-top: 3px solid #3b82f6;
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
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: #6b7280;
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

.btn-outline {
  background: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.btn-outline:hover:not(:disabled) {
  background: #3b82f6;
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
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

/* Additional styles for asset management */
.asset-management {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.asset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.asset-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.holdings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
  font-size: 16px;
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

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.current-price {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
}

.price-change {
  font-size: 14px;
  font-weight: 500;
}

.price-change.positive {
  color: #10b981;
}

.price-change.negative {
  color: #ef4444;
}

.value-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.total-value {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
}

.return-percent {
  font-size: 14px;
  font-weight: 500;
}

.return-percent.positive {
  color: #10b981;
}

.return-percent.negative {
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