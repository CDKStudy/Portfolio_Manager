import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Default user ID for demo
const DEFAULT_USER_ID = 1

// Global prediction state
let globalPredictionState = {
  isTraining: false,
  lastTrainingStart: null,
  results: null,
  hasNewResults: false
}

// Event listeners for prediction state changes
const predictionStateListeners = new Set()

function notifyPredictionStateChange() {
  predictionStateListeners.forEach(listener => listener(globalPredictionState))
}

export const portfolioAPI = {
  // Get portfolio summary
  getPortfolio: (userId = DEFAULT_USER_ID) => api.get('/portfolio', { params: { userId } }),
  
  // Get user holdings
  getHoldings: (userId = DEFAULT_USER_ID) => api.get('/portfolio/holdings', { params: { userId } }),
  
  // Get specific holding
  getHolding: (id) => api.get(`/portfolio/holdings/${id}`),
  
  // Buy stock/fund
  buyAsset: (data, userId = DEFAULT_USER_ID) => {
    const params = { userId }
    return api.post('/portfolio/buy', data, { params })
  },

  // Get real-time market watch (popular tickers)
  getMarketWatch: () => api.get('/portfolio/meta/market-watch'),

  // Sell stock/fund
  sellAsset: (data, userId = DEFAULT_USER_ID) => {
    const params = { userId }
    return api.post('/portfolio/sell', data, { params })
  },

  // Delete holding
  deleteHolding: (id) => api.delete(`/portfolio/holdings/${id}`),

  // Get transactions
  getTransactions: (userId = DEFAULT_USER_ID, limit = 50) => {
    const params = { userId, limit }
    return api.get('/portfolio/transactions', { params })
  },

  // Get user info
  getUser: (userId = DEFAULT_USER_ID) => api.get('/portfolio/user', { params: { userId } }),

  // Create user
  createUser: (userData) => api.post('/portfolio/user', userData),

  // Search stocks
  searchStocks: (query) => api.get('/portfolio/meta/search', { params: { query } }),

  // Get popular tickers
  getPopularTickers: () => api.get('/portfolio/meta/popular-tickers'),

  // Get stock price
  getStockPrice: (ticker) => api.get('/portfolio/meta/stock-price', { params: { ticker } }),

  // Cash management
  getCashBalance: (userId = DEFAULT_USER_ID) => api.get('/portfolio/cash', { params: { userId } }),
  
  // Deposit cash
  depositCash: (amount, userId = DEFAULT_USER_ID) => api.post('/portfolio/cash/deposit', { amount }, { params: { userId } }),
  
  // Withdraw cash
  withdrawCash: (amount, userId = DEFAULT_USER_ID) => api.post('/portfolio/cash/withdraw', { amount }, { params: { userId } }),

  // Get cash transactions
  getCashTransactions: (userId = DEFAULT_USER_ID, limit = 20) => api.get('/portfolio/cash/transactions', { params: { userId, limit } })
}

// Stock-specific API functions
export const stockAPI = {

  // Fetch market watch stock list (real-time prices of popular tickers)
  getMarketWatch: () => portfolioAPI.getMarketWatch(),

  // Buy stock
  buyStock: (ticker, quantity, price = null, userId = DEFAULT_USER_ID) => {
    return portfolioAPI.buyAsset({
      ticker,
      quantity,
      price,
      type: 'stock'
    }, userId)
  },

  // Sell stock
  sellStock: (ticker, quantity, price = null, userId = DEFAULT_USER_ID) => {
    return portfolioAPI.sellAsset({
      ticker,
      quantity,
      price,
      type: 'stock'
    }, userId)
  },

  // Get stock price
  getStockPrice: (ticker) => portfolioAPI.getStockPrice(ticker),

  // Search stocks
  searchStocks: (query) => portfolioAPI.searchStocks(query)
}

// Prediction API functions with task management
export const predictionAPI = {
  // Start new prediction task
  async startPrediction() {
    try {
      // Set training state
      globalPredictionState.isTraining = true
      globalPredictionState.lastTrainingStart = Date.now()
      globalPredictionState.hasNewResults = false
      notifyPredictionStateChange()

      const response = await api.post('/predict')
      return response.data
    } catch (error) {
      // Reset state on error
      globalPredictionState.isTraining = false
      globalPredictionState.hasNewResults = false
      notifyPredictionStateChange()
      throw error
    }
  },

  // Get all prediction tasks
  async getTasks() {
    const response = await api.get('/predict/tasks')
    return response.data
  },

  // Get specific task with results
  async getTask(taskId) {
    const response = await api.get(`/predict/tasks/${taskId}`)
    return response.data
  },

  // Poll for task completion
  async pollTaskStatus(taskId, onUpdate) {
    const poll = async () => {
      try {
        const response = await this.getTask(taskId)
        const task = response.task
        
        onUpdate(task)
        
        if (task.status === 'completed') {
          globalPredictionState.isTraining = false
          globalPredictionState.results = task.results
          globalPredictionState.hasNewResults = true
          notifyPredictionStateChange()
          return task
        } else if (task.status === 'failed') {
          globalPredictionState.isTraining = false
          globalPredictionState.hasNewResults = false
          notifyPredictionStateChange()
          throw new Error('Prediction task failed')
        } else {
          // Still training, poll again
          setTimeout(poll, 2000)
        }
      } catch (error) {
        globalPredictionState.isTraining = false
        globalPredictionState.hasNewResults = false
        notifyPredictionStateChange()
        throw error
      }
    }
    
    return poll()
  },

  // Get current prediction state
  getState() {
    return { ...globalPredictionState }
  },

  // Subscribe to state changes
  onStateChange(listener) {
    predictionStateListeners.add(listener)
    return () => predictionStateListeners.delete(listener)
  },

  // Mark results as viewed
  markResultsViewed() {
    globalPredictionState.hasNewResults = false
    notifyPredictionStateChange()
  }
}

// Fund-specific API functions
export const fundAPI = {
  // Buy fund
  buyFund: (ticker, quantity, price = null, userId = DEFAULT_USER_ID) => {
    return portfolioAPI.buyAsset({
      ticker,
      quantity,
      price,
      type: 'fund'
    }, userId)
  },

  // Sell fund
  sellFund: (ticker, quantity, price = null, userId = DEFAULT_USER_ID) => {
    return portfolioAPI.sellAsset({
      ticker,
      quantity,
      price,
      type: 'fund'
    }, userId)
  },

  // Get fund price (using same endpoint as stock for now)
  getFundPrice: (ticker) => portfolioAPI.getStockPrice(ticker),

  // Search funds
  searchFunds: (query) => portfolioAPI.searchStocks(query)
}

// AI-specific API functions
export const aiAPI = {
  // Chat with AI
  chat: (message, portfolioContext = null, userId = DEFAULT_USER_ID) => {
    return api.post('/portfolio/ai/chat', {
      message,
      userId,
      portfolioContext
    })
  }
}

export default api 