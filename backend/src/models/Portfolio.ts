export interface PortfolioItem {
  id: number;
  stockTicker: string;
  volume: number;
  currentPrice?: number | null;
  totalValue?: number | null;
  averageBuyPrice?: number | null;
  totalCost?: number | null;
  profitLoss?: number | null;
  profitLossPercent?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePortfolioItemRequest {
  stockTicker: string;
  volume: number;
  buyPrice?: number;
}

export interface UpdatePortfolioItemRequest {
  stockTicker?: string;
  volume?: number;
  buyPrice?: number;
}

export interface BuyRequest {
  stockTicker: string;
  volume: number;
  buyPrice?: number;
}

export interface SellRequest {
  id: number;
  volume: number;
  sellPrice?: number;
}

export interface PortfolioSummary {
  totalItems: number;
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  items: PortfolioItem[];
}

export interface Transaction {
  id: number;
  portfolioItemId: number;
  type: 'BUY' | 'SELL';
  volume: number;
  price: number;
  totalAmount: number;
  timestamp: Date;
} 