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

export default api 