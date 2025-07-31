const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const DEFAULT_USER_ID = 1;

async function checkServer() {
  try {
    await axios.get('http://localhost:3000/health');
    console.log('✅ Backend server is running');
    return true;
  } catch (error) {
    console.error('❌ Backend server is not running on port 3000');
    console.error('Please start the server with: npm run dev');
    return false;
  }
}

async function runStockTests() {
  console.log('🚀 Starting Stock Operations Tests');
  console.log('='.repeat(50));
  
  let initialCash;
  let initialHoldings;

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
    return;
  }

  // 测试1: 买入股票
  console.log('\n📈 Test 1: Buy Stock');
  try {
    const ticker = 'TSLA';
    const quantity = 2;
    const price = 250.00;

    const response = await axios.post(`${API_BASE_URL}/portfolio/buy`, {
      ticker,
      quantity,
      price,
      type: 'stock'
    }, {
      params: { userId: DEFAULT_USER_ID }
    });

    console.log('✅ Buy stock test passed:', response.data.message);
    console.log('   Holding:', {
      ticker: response.data.holding.ticker,
      quantity: response.data.holding.quantity,
      buyPrice: response.data.holding.buyPrice
    });
  } catch (error) {
    console.error('❌ Buy stock test failed:', error.response?.data || error.message);
  }

  // 测试2: 卖出股票
  console.log('\n📉 Test 2: Sell Stock');
  try {
    const ticker = 'TSLA';
    const quantity = 1;
    const price = 260.00;

    const response = await axios.post(`${API_BASE_URL}/portfolio/sell`, {
      ticker,
      quantity,
      price,
      type: 'stock'
    }, {
      params: { userId: DEFAULT_USER_ID }
    });

    console.log('✅ Sell stock test passed:', response.data.message);
  } catch (error) {
    console.error('❌ Sell stock test failed:', error.response?.data || error.message);
  }

  // 测试3: 验证持仓
  console.log('\n📊 Test 3: Verify Holdings');
  try {
    const response = await axios.get(`${API_BASE_URL}/portfolio/holdings?userId=${DEFAULT_USER_ID}`);
    
    const stockHoldings = response.data.holdings.filter(h => h.type === 'stock');
    console.log('✅ Verify holdings test passed');
    console.log('   Current stock holdings:', stockHoldings.map(h => ({
      ticker: h.ticker,
      quantity: h.quantity,
      buyPrice: h.buyPrice,
      totalValue: h.totalValue
    })));
  } catch (error) {
    console.error('❌ Verify holdings test failed:', error.response?.data || error.message);
  }

  // 测试4: 检查现金余额
  console.log('\n💰 Test 4: Check Cash Balance');
  try {
    const response = await axios.get(`${API_BASE_URL}/portfolio/user?userId=${DEFAULT_USER_ID}`);
    
    console.log('✅ Check cash balance test passed');
    console.log('   Current cash balance:', response.data.cash);
    console.log('   Initial cash balance:', initialCash);
    console.log('   Cash change:', response.data.cash - initialCash);
  } catch (error) {
    console.error('❌ Check cash balance test failed:', error.response?.data || error.message);
  }

  console.log('\n🎉 Stock operations tests completed!');
}

async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await runStockTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runStockTests }; 