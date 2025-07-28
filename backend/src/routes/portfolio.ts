import { Router, Request, Response } from 'express';
import { Database } from '../models/Database';
import { FinancialDataService } from '../services/FinancialDataService';
import { CreatePortfolioItemRequest, UpdatePortfolioItemRequest, PortfolioSummary, BuyRequest, SellRequest } from '../models/Portfolio';

const router = Router();
const db = new Database();
const financialService = new FinancialDataService();

// GET /api/portfolio - Get all portfolio items
router.get('/', async (req: Request, res: Response) => {
  try {
    const items = await db.getAllPortfolioItems();
    
    // Update prices for all items
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        const priceData = await financialService.getStockPrice(item.stockTicker);
        if (priceData) {
          await db.updateItemPrice(item.id, priceData.price);
          return {
            ...item,
            currentPrice: priceData.price,
            totalValue: item.volume * priceData.price
          };
        }
        return item;
      })
    );

    const totalCost = updatedItems.reduce((sum, item) => sum + (item.totalCost || 0), 0);
    const totalProfitLoss = updatedItems.reduce((sum, item) => sum + (item.profitLoss || 0), 0);
    const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

    const summary: PortfolioSummary = {
      totalItems: updatedItems.length,
      totalValue: updatedItems.reduce((sum, item) => sum + (item.totalValue || 0), 0),
      totalCost,
      totalProfitLoss,
      totalProfitLossPercent,
      items: updatedItems
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/portfolio/:id - Get specific portfolio item
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const item = await db.getPortfolioItem(id);
    if (!item) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }

    // Update price
    const priceData = await financialService.getStockPrice(item.stockTicker);
    if (priceData) {
      await db.updateItemPrice(item.id, priceData.price);
      item.currentPrice = priceData.price;
      item.totalValue = item.volume * priceData.price;
    }

    res.json(item);
  } catch (error) {
    console.error('Error fetching portfolio item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/portfolio - Create new portfolio item
router.post('/', async (req: Request, res: Response) => {
  try {
    const { stockTicker, volume }: CreatePortfolioItemRequest = req.body;

    if (!stockTicker || !volume || volume <= 0) {
      return res.status(400).json({ 
        error: 'Stock ticker and positive volume are required' 
      });
    }

    // Validate that we can get price data for this ticker
    const priceData = await financialService.getStockPrice(stockTicker);
    if (!priceData) {
      return res.status(400).json({ 
        error: `Price data not available for ticker: ${stockTicker}. Try popular stocks like AAPL, MSFT, GOOGL, etc.` 
      });
    }

    const newItem = await db.createPortfolioItem({ stockTicker: stockTicker.toUpperCase(), volume });
    
    // Update with current price
    await db.updateItemPrice(newItem.id, priceData.price);
    newItem.currentPrice = priceData.price;
    newItem.totalValue = newItem.volume * priceData.price;

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/portfolio/:id - Update portfolio item
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const updates: UpdatePortfolioItemRequest = req.body;

    if (updates.volume !== undefined && updates.volume <= 0) {
      return res.status(400).json({ error: 'Volume must be positive' });
    }

    // If stockTicker is being updated, validate it
    if (updates.stockTicker) {
      const priceData = await financialService.getStockPrice(updates.stockTicker);
      if (!priceData) {
        return res.status(400).json({ 
          error: `Price data not available for ticker: ${updates.stockTicker}. Try popular stocks like AAPL, MSFT, GOOGL, etc.` 
        });
      }
      updates.stockTicker = updates.stockTicker.toUpperCase();
    }

    const updatedItem = await db.updatePortfolioItem(id, updates);
    if (!updatedItem) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }

    // Update price
    const priceData = await financialService.getStockPrice(updatedItem.stockTicker);
    if (priceData) {
      await db.updateItemPrice(updatedItem.id, priceData.price);
      updatedItem.currentPrice = priceData.price;
      updatedItem.totalValue = updatedItem.volume * priceData.price;
    }

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/portfolio/:id - Delete portfolio item
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const deleted = await db.deletePortfolioItem(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/portfolio/popular-tickers - Get popular stock tickers
router.get('/meta/popular-tickers', async (req: Request, res: Response) => {
  try {
    const tickers = financialService.getPopularTickers();
    res.json({ tickers });
  } catch (error) {
    console.error('Error fetching popular tickers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/portfolio/search-stocks - Search for stocks
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

// GET /api/portfolio/stock-price - Get stock price
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

// POST /api/portfolio/buy - Buy stocks
router.post('/buy', async (req: Request, res: Response) => {
  try {
    const { stockTicker, volume, buyPrice }: BuyRequest = req.body;

    if (!stockTicker || !volume || volume <= 0) {
      return res.status(400).json({ 
        error: 'Stock ticker and positive volume are required' 
      });
    }

    // Get current market price if not provided
    let marketPrice = buyPrice;
    if (!marketPrice) {
      const priceData = await financialService.getStockPrice(stockTicker);
      if (!priceData) {
        return res.status(400).json({ 
          error: `Price data not available for ticker: ${stockTicker}` 
        });
      }
      marketPrice = priceData.price;
    }

    const boughtItem = await db.buyStock({
      stockTicker: stockTicker.toUpperCase(),
      volume,
      buyPrice: marketPrice
    });

    // Update with current price and profit/loss
    await db.updateProfitLoss(boughtItem.id, marketPrice);
    const updatedItem = await db.getPortfolioItem(boughtItem.id);

    res.status(201).json({
      message: `Successfully bought ${volume} shares of ${stockTicker.toUpperCase()} at $${marketPrice}`,
      item: updatedItem
    });
  } catch (error) {
    console.error('Error buying stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/portfolio/sell - Sell stocks
router.post('/sell', async (req: Request, res: Response) => {
  try {
    const { id, volume, sellPrice }: SellRequest = req.body;

    if (!id || !volume || volume <= 0) {
      return res.status(400).json({ 
        error: 'Portfolio item ID and positive volume are required' 
      });
    }

    // Get current market price if not provided
    let marketPrice = sellPrice;
    if (!marketPrice) {
      const item = await db.getPortfolioItem(id);
      if (!item) {
        return res.status(404).json({ error: 'Portfolio item not found' });
      }
      
      const priceData = await financialService.getStockPrice(item.stockTicker);
      if (!priceData) {
        return res.status(400).json({ 
          error: `Price data not available for ticker: ${item.stockTicker}` 
        });
      }
      marketPrice = priceData.price;
    }

    const result = await db.sellStock({
      id,
      volume,
      sellPrice: marketPrice
    });

    res.json({
      message: `Successfully sold ${volume} shares at $${marketPrice}`,
      soldAmount: result.soldAmount,
      remainingVolume: result.remainingVolume
    });
  } catch (error) {
    console.error('Error selling stock:', error);
    if (error instanceof Error && error.message.includes('Insufficient shares')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// GET /api/portfolio/transactions - Get transaction history
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const { itemId } = req.query;
    const transactions = await db.getTransactionHistory(
      itemId ? parseInt(itemId as string) : undefined
    );
    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 