import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const portfolioAPI = {
  // Get all portfolio items with summary
  getPortfolio: () => api.get('/portfolio'),
  
  // Get specific portfolio item
  getPortfolioItem: (id) => api.get(`/portfolio/${id}`),
  
  // Create new portfolio item
  createPortfolioItem: (data) => api.post('/portfolio', data),
  
  // Update portfolio item
  updatePortfolioItem: (id, data) => api.put(`/portfolio/${id}`, data),
  
  // Delete portfolio item
  deletePortfolioItem: (id) => api.delete(`/portfolio/${id}`),
  
  // Get available tickers
  getAvailableTickers: () => api.get('/portfolio/meta/available-tickers'),

  // Buy stock
  buyStock: (buyData) => api.post('/portfolio/buy', buyData),

  // Sell stock
  sellStock: (sellData) => api.post('/portfolio/sell', sellData),

  // Get transactions
  getTransactions: (itemId = null) => {
    const params = itemId ? { itemId } : {}
    return api.get('/portfolio/transactions', { params })
  },

  // Search stocks
  searchStocks: (query) => api.get('/portfolio/meta/search', { params: { query } }),

  // Get popular tickers
  getPopularTickers: () => api.get('/portfolio/meta/popular-tickers'),

  // Get stock price
  getStockPrice: (ticker) => api.get('/portfolio/meta/stock-price', { params: { ticker } })
}

export default api 