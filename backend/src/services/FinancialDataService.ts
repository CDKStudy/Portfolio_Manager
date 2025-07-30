import yahooFinance from 'yahoo-finance2';

export interface StockPrice {
  ticker: string;
  price: number;
  lastUpdated: string;
  change?: number;
  changePercent?: number;
  volume?: number;
  marketCap?: number;
}

export interface StockQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  marketCap: number;
  regularMarketTime: number;
}

export class FinancialDataService {
  private cache: Map<string, { data: StockPrice; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  async getStockPrice(ticker: string): Promise<StockPrice | null> {
    try {
      const upperTicker = ticker.toUpperCase();
      
      // Check cache first
      const cached = this.cache.get(upperTicker);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }


      // Fetch from Yahoo Finance
      const quote = await yahooFinance.quote(upperTicker);
      
      if (quote && quote.regularMarketPrice) {
        const stockPrice: StockPrice = {
          ticker: upperTicker,
          price: quote.regularMarketPrice,
          lastUpdated: quote.regularMarketTime && typeof quote.regularMarketTime === 'number' ? new Date(quote.regularMarketTime * 1000).toISOString() : new Date().toISOString(),
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          volume: quote.regularMarketVolume,
          marketCap: quote.marketCap
        };

        // Cache the result
        this.cache.set(upperTicker, {
          data: stockPrice,
          timestamp: Date.now()
        });

        return stockPrice;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching price for ${ticker}:`, error);
      return null;
    }
  }

  async getMultipleStockPrices(tickers: string[]): Promise<StockPrice[]> {
    const promises = tickers.map(ticker => this.getStockPrice(ticker));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<StockPrice | null> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value!);
  }

  async searchStocks(query: string): Promise<string[]> {
    try {
      const results = await yahooFinance.search(query);
      // Handle different possible return types from yahoo-finance2
      if (Array.isArray(results)) {
        return results.map((result: any) => result.symbol);
      } else if (results && typeof results === 'object' && 'quotes' in results) {
        return (results as any).quotes.map((quote: any) => quote.symbol);
      }
      return [];
    } catch (error) {
      console.error(`Error searching stocks for ${query}:`, error);
      return [];
    }
  }

  async getStockHistory(ticker: string, period: string = '1mo'): Promise<any[]> {
    try {
      const history = await yahooFinance.historical(ticker, {
        period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        period2: new Date(),
        interval: '1d'
      });
      
      return history.map(day => ({
        date: day.date,
        open: day.open,
        high: day.high,
        low: day.low,
        close: day.close,
        volume: day.volume
      }));
    } catch (error) {
      console.error(`Error fetching history for ${ticker}:`, error);
      return [];
    }
  }

  // Popular stock tickers for suggestions
  getPopularTickers(): string[] {
    return [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
      'JPM', 'JNJ', 'PG', 'UNH', 'HD', 'MA', 'V', 'PYPL', 'BAC', 'ADBE',
      'CRM', 'ABT', 'KO', 'PEP', 'TMO', 'AVGO', 'COST', 'DHR', 'NEE',
      'LLY', 'ABBV', 'WMT', 'MRK', 'ACN', 'TXN', 'VZ', 'CMCSA', 'PFE'
    ];
  }

  // ea list of popular Chinese ETFs with Yahoo-compatible tickers
getPopularFundTickers(): string[] {
  return [
    // Broad market indices
    '510300.SS', // CSI 300 ETF (Huatai-Pinebridge)
    '510500.SZ', // CSI 500 ETF (Southern Fund)
    '159915.SZ', // ChiNext ETF (E Fund)

    // Tech, innovation, and green energy
    '515000.SS', // STAR 50 ETF (Sci-Tech Innovation Board)
    '516160.SS', // Carbon Neutrality ETF
    '588000.SS', // STAR Market 50 ETF
    '159806.SZ', // ChiNext 50 ETF
    '159992.SZ', // China Internet ETF

    // Financial sector: banks, brokers, insurance
    '512800.SS', // Bank ETF
    '512000.SS', // Securities ETF
    '512910.SS', // Insurance ETF

    // Industry sectors: healthcare, consumption, defense
    '512010.SS', // Healthcare ETF
    '159928.SZ', // Consumer ETF
    '512660.SS', // Defense ETF (Military)
    '512690.SS', // Liquor & Spirits ETF

    // Green energy, EV, semiconductors
    '516110.SS', // New Energy Vehicle ETF
    '512480.SS', // Semiconductor ETF
    '159865.SZ', // New Energy ETF

    // Additional indices
    '512100.SS', // CSI 100 ETF
    '515050.SS', // Emerging Industries ETF
    '159949.SZ', // CSI 500 ETF (E Fund)

    // Real estate, infrastructure, steel
    '512200.SS', // Real Estate ETF
    '512970.SS', // Construction ETF
    '512030.SS', // Steel ETF
  ];
}

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
} 