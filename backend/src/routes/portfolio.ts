import { Request, Response, Router } from 'express';
import { Database } from '../models/Database';
import AIService from '../services/AIService';
import { FinancialDataService } from '../services/FinancialDataService';

const router = Router();
const db = new Database();
const financialService = new FinancialDataService();

// Default user ID for demo purposes
const DEFAULT_USER_ID = 1;

// GET /api/portfolio - Get portfolio summary
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.userId as string) || DEFAULT_USER_ID;
    
    // Get user info
    const user = await db.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get portfolio summary
    const summary = await db.getPortfolioSummary(userId);
    console.log('Portfolio Summary:', summary);
    res.json({
      totalItems: summary.totalHoldings,
      totalValue: summary.totalValue,
      totalCost: summary.totalCost,
      totalProfitLoss: summary.totalProfitLoss,
      totalProfitLossPercent: summary.totalCost > 0 ? (summary.totalProfitLoss / summary.totalCost) * 100 : 0,
      cash: summary.cash,
      netWorth: summary.netWorth,
      items: [] // Will be populated separately
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/portfolio/holdings - Get user holdings
router.get('/holdings', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.userId as string) || DEFAULT_USER_ID;
    
    const holdings = await db.getHoldings(userId);
    
    // Update prices for all holdings
    const updatedHoldings = await Promise.all(
      holdings.map(async (holding) => {
        const priceData = await financialService.getStockPrice(holding.ticker);
        if (priceData) {
          return {
            ...holding,
            currentPrice: priceData.price,
            totalValue: holding.quantity * priceData.price,
            profitLoss: (priceData.price - holding.buyPrice) * holding.quantity,
            profitLossPercent: ((priceData.price - holding.buyPrice) / holding.buyPrice) * 100
          };
        }
        return {
          ...holding,
          currentPrice: holding.buyPrice,
          totalValue: holding.quantity * holding.buyPrice,
          profitLoss: 0,
          profitLossPercent: 0
        };
      })
    );

    res.json({ holdings: updatedHoldings });
  } catch (error) {
    console.error('Error fetching holdings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/portfolio/transactions - Get transaction history
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.userId as string) || DEFAULT_USER_ID;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const transactions = await db.getTransactions(userId, limit);
    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/portfolio/buy - Buy stocks/funds
router.post('/buy', async (req: Request, res: Response) => {
  try {
    const { ticker, quantity, price, type = 'stock' }: {
      ticker: string;
      quantity: number;
      price?: number;
      type?: 'stock' | 'fund';
    } = req.body;

    const userId = parseInt(req.query.userId as string) || DEFAULT_USER_ID;

    if (!ticker || !quantity || quantity <= 0) {
      return res.status(400).json({ 
        error: 'Ticker and positive quantity are required' 
      });
    }

    // Get current market price if not provided
    let marketPrice = price;
    if (!marketPrice) {
      const priceData = await financialService.getStockPrice(ticker);
    if (!priceData) {
      return res.status(400).json({ 
          error: `Price data not available for ticker: ${ticker}` 
        });
      }
      marketPrice = priceData.price;
    }

    const result = await db.buyAsset(userId, type, ticker.toUpperCase(), quantity, marketPrice);

    if (!result.success) {
      return res.status(400).json({ error: 'Failed to buy asset' });
    }

    res.status(201).json({
      message: `Successfully bought ${quantity} ${type === 'fund' ? 'units' : 'shares'} of ${ticker.toUpperCase()} at $${marketPrice}`,
      holding: result.holding
    });
  } catch (error) {
    console.error('Error buying asset:', error);
    if (error instanceof Error) {
      if (error.message.includes('Insufficient cash')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
    res.status(500).json({ error: 'Internal server error' });
  }
  }
});

// POST /api/portfolio/sell - Sell stocks/funds
router.post('/sell', async (req: Request, res: Response) => {
  try {
    const { ticker, quantity, price, type = 'stock' }: {
      ticker: string;
      quantity: number;
      price?: number;
      type?: 'stock' | 'fund';
    } = req.body;

    const userId = parseInt(req.query.userId as string) || DEFAULT_USER_ID;

    if (!ticker || !quantity || quantity <= 0) {
      return res.status(400).json({ 
        error: 'Ticker and positive quantity are required' 
      });
    }

    // Get current market price if not provided
    let marketPrice = price;
    if (!marketPrice) {
      const priceData = await financialService.getStockPrice(ticker);
      if (!priceData) {
        return res.status(400).json({ 
          error: `Price data not available for ticker: ${ticker}` 
        });
      }
      marketPrice = priceData.price;
    }

    const result = await db.sellAsset(userId, type, ticker.toUpperCase(), quantity, marketPrice);

    if (!result.success) {
      return res.status(400).json({ error: 'Failed to sell asset' });
    }

    res.json({
      message: `Successfully sold ${quantity} ${type === 'fund' ? 'units' : 'shares'} of ${ticker.toUpperCase()} at $${marketPrice}`,
      remainingQuantity: result.remainingQuantity
    });
  } catch (error) {
    console.error('Error selling asset:', error);
    if (error instanceof Error) {
      if (error.message.includes('Insufficient quantity') || error.message.includes('Holding not found')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
    res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// DELETE /api/portfolio/holdings/:id - Delete holding
router.delete('/holdings/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const deleted = await db.deleteHolding(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Holding not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting holding:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/portfolio/meta/stock-price - Get stock price
router.get('/meta/stock-price', async (req: Request, res: Response) => {
  try {
    const { ticker } = req.query;
    if (!ticker || typeof ticker !== 'string') {
      return res.status(400).json({ error: 'Ticker parameter is required' });
    }
    
    const priceData = await financialService.getStockPrice(ticker);
    if (!priceData) {
      return res.status(404).json({ error: `Price data not available for ${ticker}` });
    }
    
    res.json(priceData);
  } catch (error) {
    console.error('Error fetching stock price:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/portfolio/meta/search - Search for stocks
router.get('/meta/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await financialService.searchStocks(query);
    res.json({ results });
  } catch (error) {
    console.error('Error searching stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/portfolio/meta/popular-tickers - Get popular stock tickers
router.get('/meta/popular-tickers', async (req: Request, res: Response) => {
  try {
    const tickers = financialService.getPopularTickers();
    res.json({ tickers });
  } catch (error) {
    console.error('Error fetching popular tickers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//NEW ADD ------
// GET /api/portfolio/meta/market-watch - Get real-time prices for popular tickers
router.get('/meta/market-watch', async (req: Request, res: Response) => {
  try {
    const tickers = financialService.getPopularTickers(); // Hot Stock List
    const prices = await financialService.getMultipleStockPrices(tickers); // Batch get market information
    res.json({ stocks: prices });
  } catch (error) {
    console.error('Error fetching market watch data:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});


// GET /api/portfolio/user - Get user info
router.get('/user', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.userId as string) || DEFAULT_USER_ID;
    
    const user = await db.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/portfolio/user - Create user
router.post('/user', async (req: Request, res: Response) => {
  try {
    const { username, cash = 0 }: { username: string; cash?: number } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = await db.createUser(username, cash);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/portfolio/ai/chat - AI chat endpoint
router.post('/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, userId = DEFAULT_USER_ID, portfolioContext }: {
      message: string;
      userId?: number;
      portfolioContext?: any;
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get portfolio context if not provided
    let context = portfolioContext;
    if (!context) {
      try {
        const summary = await db.getPortfolioSummary(userId);
        const holdings = await db.getHoldings(userId);
        context = {
          totalValue: summary.totalValue,
          cash: summary.cash,
          holdingsCount: summary.totalHoldings,
          holdings: holdings
        };
      } catch (error) {
        console.error('Error getting portfolio context:', error);
        // Continue without context
      }
    }

    // Get AI response (will automatically fallback to mock if API fails)
    const aiResponse = await AIService.chat(message, context);

    res.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      model: 'ep-20250729110435-7bvhm'
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/portfolio/cash - Get user cash balance
router.get('/cash', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.userId as string) || DEFAULT_USER_ID;
    
    const user = await db.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      userId: user.id,
      cash: user.cash,
      netWorth: user.netWorth
    });
  } catch (error) {
    console.error('Error fetching cash balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/portfolio/cash/deposit - Add cash to account
router.post('/cash/deposit', async (req: Request, res: Response) => {
  try {
    const { amount }: { amount: number } = req.body;
    const userId = parseInt(req.query.userId as string) || DEFAULT_USER_ID;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const user = await db.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newCash = user.cash + amount;
    await db.updateUserCash(userId, newCash);

    // Record cash deposit transaction
    await db.createTransaction({
      userId,
      assetType: 'cash',
      ticker: 'CASH',
      action: 'buy',
      quantity: amount,
      price: 1
    });

    // Update net worth
    const summary = await db.getPortfolioSummary(userId);
    await db.updateUserNetWorth(userId, summary.netWorth);

    res.json({
      message: `Successfully deposited $${amount}`,
      newBalance: newCash,
      netWorth: summary.netWorth
    });
  } catch (error) {
    console.error('Error depositing cash:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/portfolio/cash/withdraw - Withdraw cash from account
router.post('/cash/withdraw', async (req: Request, res: Response) => {
  try {
    const { amount }: { amount: number } = req.body;
    const userId = parseInt(req.query.userId as string) || DEFAULT_USER_ID;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const user = await db.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.cash < amount) {
      return res.status(400).json({ error: 'Insufficient cash balance' });
    }

    const newCash = user.cash - amount;
    await db.updateUserCash(userId, newCash);

    // Record cash withdrawal transaction
    await db.createTransaction({
      userId,
      assetType: 'cash',
      ticker: 'CASH',
      action: 'sell',
      quantity: amount,
      price: 1
    });

    // Update net worth
    const summary = await db.getPortfolioSummary(userId);
    await db.updateUserNetWorth(userId, summary.netWorth);

    res.json({
      message: `Successfully withdrew $${amount}`,
      newBalance: newCash,
      netWorth: summary.netWorth
    });
  } catch (error) {
    console.error('Error withdrawing cash:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/portfolio/cash/transactions - Get cash transactions
router.get('/cash/transactions', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.userId as string) || DEFAULT_USER_ID;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const transactions = await db.getCashTransactions(userId, limit);
    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching cash transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/portfolio/analytics/asset-allocation - Get asset allocation data
router.get('/analytics/asset-allocation', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.userId as string) || DEFAULT_USER_ID;
    
    // Get user info
    const user = await db.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get holdings
    const holdings = await db.getHoldings(userId);
    
    // Calculate asset allocation
    const cashValue = user.cash;
    let stocksValue = 0;
    let fundsValue = 0;
    
    const stockHoldings = [];
    const fundHoldings = [];
    
    for (const holding of holdings) {
      const priceData = await financialService.getStockPrice(holding.ticker);
      const currentPrice = priceData ? priceData.price : holding.buyPrice;
      const totalValue = holding.quantity * currentPrice;
      
      if (holding.type === 'stock') {
        stocksValue += totalValue;
        stockHoldings.push({
          ticker: holding.ticker,
          value: totalValue,
          quantity: holding.quantity,
          percentage: 0 // Will be calculated later
        });
      } else if (holding.type === 'fund') {
        fundsValue += totalValue;
        fundHoldings.push({
          ticker: holding.ticker,
          value: totalValue,
          quantity: holding.quantity,
          percentage: 0 // Will be calculated later
        });
      }
    }
    
    const totalValue = cashValue + stocksValue + fundsValue;
    
    // Calculate percentages
    const cashPercentage = totalValue > 0 ? (cashValue / totalValue) * 100 : 0;
    const stocksPercentage = totalValue > 0 ? (stocksValue / totalValue) * 100 : 0;
    const fundsPercentage = totalValue > 0 ? (fundsValue / totalValue) * 100 : 0;
    
    // Calculate individual stock percentages
    stockHoldings.forEach(holding => {
      holding.percentage = stocksValue > 0 ? (holding.value / stocksValue) * 100 : 0;
    });
    
    // Calculate individual fund percentages
    fundHoldings.forEach(holding => {
      holding.percentage = fundsValue > 0 ? (holding.value / fundsValue) * 100 : 0;
    });
    
    res.json({
      assetAllocation: {
        cash: { value: cashValue, percentage: cashPercentage },
        stocks: { value: stocksValue, percentage: stocksPercentage },
        funds: { value: fundsValue, percentage: fundsPercentage }
      },
      stockHoldings,
      fundHoldings,
      totalValue
    });
  } catch (error) {
    console.error('Error fetching asset allocation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 