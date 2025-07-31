const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const DEFAULT_USER_ID = 1;

describe('Stock Operations Tests (Simple)', () => {
  let initialCash;
  let initialHoldings;

  beforeAll(async () => {
    // 获取初始状态
    try {
      const userResponse = await axios.get(`${API_BASE_URL}/portfolio/user?userId=${DEFAULT_USER_ID}`);
      initialCash = userResponse.data.cash;
      
      const holdingsResponse = await axios.get(`${API_BASE_URL}/portfolio/holdings?userId=${DEFAULT_USER_ID}`);
      initialHoldings = holdingsResponse.data.holdings || [];
      
      console.log('Initial state:', {
        cash: initialCash,
        holdingsCount: initialHoldings.length
      });
    } catch (error) {
      console.error('Failed to get initial state:', error.message);
    }
  });

  test('Buy Stock with Fixed Price', async () => {
    const ticker = 'TSLA';
    const quantity = 2;
    const price = 250.00;

    try {
      const response = await axios.post(`${API_BASE_URL}/portfolio/buy`, {
        ticker,
        quantity,
        price,
        type: 'stock'
      }, {
        params: { userId: DEFAULT_USER_ID }
      });

      expect(response.status).toBe(201);
      expect(response.data.message).toContain('Successfully bought');
      expect(response.data.message).toContain(ticker);
      expect(response.data.holding).toBeDefined();
      expect(response.data.holding.ticker).toBe(ticker.toUpperCase());
      // 检查数量是否增加，而不是等于指定数量（因为可能已存在持仓）
      expect(response.data.holding.quantity).toBeGreaterThanOrEqual(quantity);
      expect(response.data.holding.buyPrice).toBe(price);

      console.log('✅ Buy stock test passed:', response.data.message);
    } catch (error) {
      console.error('❌ Buy stock test failed:', error.response?.data || error.message);
      throw error;
    }
  }, 10000);

  test('Sell Stock', async () => {
    const ticker = 'TSLA';
    const quantity = 1;
    const price = 260.00;

    try {
      const response = await axios.post(`${API_BASE_URL}/portfolio/sell`, {
        ticker,
        quantity,
        price,
        type: 'stock'
      }, {
        params: { userId: DEFAULT_USER_ID }
      });

      expect(response.status).toBe(200);
      expect(response.data.message).toContain('Successfully sold');
      expect(response.data.message).toContain(ticker);

      console.log('✅ Sell stock test passed:', response.data.message);
    } catch (error) {
      console.error('❌ Sell stock test failed:', error.response?.data || error.message);
      throw error;
    }
  }, 10000);

  test('Verify Holdings After Operations', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/portfolio/holdings?userId=${DEFAULT_USER_ID}`);
      
      expect(response.status).toBe(200);
      expect(response.data.holdings).toBeDefined();
      
      const stockHoldings = response.data.holdings.filter(h => h.type === 'stock');
      console.log('Current stock holdings:', stockHoldings.map(h => ({
        ticker: h.ticker,
        quantity: h.quantity,
        buyPrice: h.buyPrice,
        totalValue: h.totalValue
      })));

      expect(stockHoldings.length).toBeGreaterThan(0);
    } catch (error) {
      console.error('❌ Verify holdings test failed:', error.response?.data || error.message);
      throw error;
    }
  }, 10000);

  test('Check Cash Balance After Operations', async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/portfolio/user?userId=${DEFAULT_USER_ID}`);
      
      expect(response.status).toBe(200);
      expect(response.data.cash).toBeDefined();
      
      console.log('Current cash balance:', response.data.cash);
      console.log('Initial cash balance:', initialCash);
      
      // 现金应该因为买卖操作而发生变化
      expect(response.data.cash).not.toBe(initialCash);
    } catch (error) {
      console.error('❌ Check cash balance test failed:', error.response?.data || error.message);
      throw error;
    }
  }, 10000);
}); 