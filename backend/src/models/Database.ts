import mysql from 'mysql2/promise';
import { PortfolioItem, CreatePortfolioItemRequest, UpdatePortfolioItemRequest } from './Portfolio';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export class Database {
  private pool: mysql.Pool;

  constructor(config?: DatabaseConfig) {
    const dbConfig = config || {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'portfolio_manager'
    };

    this.pool = mysql.createPool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    });

    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      // First, create database if it doesn't exist (connect without specifying database)
      const tempConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        charset: 'utf8mb4'
      };
      
      const tempConnection = await mysql.createConnection(tempConfig);
      await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'portfolio_manager'}`);
      await tempConnection.end();

      // Now create table in the target database (our pool already connects to the right database)
      const connection = await this.pool.getConnection();
      
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS portfolio_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          stock_ticker VARCHAR(10) NOT NULL,
          volume INT NOT NULL,
          current_price DECIMAL(10, 2) DEFAULT NULL,
          total_value DECIMAL(15, 2) DEFAULT NULL,
          average_buy_price DECIMAL(10, 2) DEFAULT NULL,
          total_cost DECIMAL(15, 2) DEFAULT NULL,
          profit_loss DECIMAL(15, 2) DEFAULT NULL,
          profit_loss_percent DECIMAL(10, 4) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_stock_ticker (stock_ticker),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `;

      const createTransactionsTableQuery = `
        CREATE TABLE IF NOT EXISTS transactions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          portfolio_item_id INT NOT NULL,
          type ENUM('BUY', 'SELL') NOT NULL,
          volume INT NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          total_amount DECIMAL(15, 2) NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (portfolio_item_id) REFERENCES portfolio_items(id) ON DELETE CASCADE,
          INDEX idx_portfolio_item_id (portfolio_item_id),
          INDEX idx_timestamp (timestamp)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `;

      await connection.execute(createTableQuery);
      await connection.execute(createTransactionsTableQuery);
      connection.release();
      
      console.log('MySQL database initialized successfully');
    } catch (error) {
      console.error('Error initializing MySQL database:', error);
      throw error;
    }
  }

  async getAllPortfolioItems(): Promise<PortfolioItem[]> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM portfolio_items ORDER BY created_at DESC'
      );
      
             return (rows as any[]).map(row => ({
        id: row.id,
        stockTicker: row.stock_ticker,
        volume: row.volume,
        currentPrice: row.current_price ? parseFloat(row.current_price) : undefined,
        totalValue: row.total_value ? parseFloat(row.total_value) : undefined,
        averageBuyPrice: row.average_buy_price ? parseFloat(row.average_buy_price) : undefined,
        totalCost: row.total_cost ? parseFloat(row.total_cost) : undefined,
        profitLoss: row.profit_loss ? parseFloat(row.profit_loss) : undefined,
        profitLossPercent: row.profit_loss_percent ? parseFloat(row.profit_loss_percent) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }));
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
      throw error;
    }
  }

  async getPortfolioItem(id: number): Promise<PortfolioItem | null> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM portfolio_items WHERE id = ?',
        [id]
      );
      
      const rowArray = rows as any[];
      if (rowArray.length === 0) {
        return null;
      }

      const row = rowArray[0];
             return {
        id: row.id,
        stockTicker: row.stock_ticker,
        volume: row.volume,
        currentPrice: row.current_price ? parseFloat(row.current_price) : undefined,
        totalValue: row.total_value ? parseFloat(row.total_value) : undefined,
        averageBuyPrice: row.average_buy_price ? parseFloat(row.average_buy_price) : undefined,
        totalCost: row.total_cost ? parseFloat(row.total_cost) : undefined,
        profitLoss: row.profit_loss ? parseFloat(row.profit_loss) : undefined,
        profitLossPercent: row.profit_loss_percent ? parseFloat(row.profit_loss_percent) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      };
    } catch (error) {
      console.error('Error fetching portfolio item:', error);
      throw error;
    }
  }

  async createPortfolioItem(item: CreatePortfolioItemRequest): Promise<PortfolioItem> {
    try {
      const [result] = await this.pool.execute(
        'INSERT INTO portfolio_items (stock_ticker, volume) VALUES (?, ?)',
        [item.stockTicker, item.volume]
      );

      const insertId = (result as any).insertId;
      const createdItem = await this.getPortfolioItem(insertId);
      
      if (!createdItem) {
        throw new Error('Failed to retrieve created portfolio item');
      }

      return createdItem;
    } catch (error) {
      console.error('Error creating portfolio item:', error);
      throw error;
    }
  }

  async updatePortfolioItem(id: number, updates: UpdatePortfolioItemRequest): Promise<PortfolioItem | null> {
    try {
      const setClause: string[] = [];
      const values: any[] = [];

      if (updates.stockTicker !== undefined) {
        setClause.push('stock_ticker = ?');
        values.push(updates.stockTicker);
      }
      if (updates.volume !== undefined) {
        setClause.push('volume = ?');
        values.push(updates.volume);
      }

      if (setClause.length === 0) {
        return await this.getPortfolioItem(id);
      }

      setClause.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const query = `UPDATE portfolio_items SET ${setClause.join(', ')} WHERE id = ?`;
      
      const [result] = await this.pool.execute(query, values);
      
      if ((result as any).affectedRows === 0) {
        return null;
      }

      return await this.getPortfolioItem(id);
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      throw error;
    }
  }

  async deletePortfolioItem(id: number): Promise<boolean> {
    try {
      const [result] = await this.pool.execute(
        'DELETE FROM portfolio_items WHERE id = ?',
        [id]
      );

      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      throw error;
    }
  }

  async updateItemPrice(id: number, price: number): Promise<void> {
    try {
      await this.pool.execute(
        'UPDATE portfolio_items SET current_price = ?, total_value = volume * ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [price, price, id]
      );
    } catch (error) {
      console.error('Error updating item price:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    try {
      await this.pool.end();
      console.log('MySQL connection pool closed');
    } catch (error) {
      console.error('Error closing MySQL connection pool:', error);
    }
  }

  // Buy stocks
  async buyStock(buyRequest: { stockTicker: string; volume: number; buyPrice: number }): Promise<PortfolioItem> {
    try {
      const { stockTicker, volume, buyPrice } = buyRequest;
      const totalCost = volume * buyPrice;

      // Check if stock already exists in portfolio
      const [existingRows] = await this.pool.execute(
        'SELECT * FROM portfolio_items WHERE stock_ticker = ?',
        [stockTicker]
      );

      if ((existingRows as any[]).length > 0) {
        // Update existing position
        const existing = (existingRows as any[])[0];
        const newVolume = existing.volume + volume;
        const newTotalCost = (existing.total_cost || 0) + totalCost;
        const newAverageBuyPrice = newTotalCost / newVolume;

        await this.pool.execute(
          `UPDATE portfolio_items 
           SET volume = ?, average_buy_price = ?, total_cost = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [newVolume, newAverageBuyPrice, newTotalCost, existing.id]
        );

        // Record transaction
        await this.pool.execute(
          'INSERT INTO transactions (portfolio_item_id, type, volume, price, total_amount) VALUES (?, ?, ?, ?, ?)',
          [existing.id, 'BUY', volume, buyPrice, totalCost]
        );

        return await this.getPortfolioItem(existing.id) as PortfolioItem;
      } else {
        // Create new position
        const [result] = await this.pool.execute(
          'INSERT INTO portfolio_items (stock_ticker, volume, average_buy_price, total_cost) VALUES (?, ?, ?, ?)',
          [stockTicker, volume, buyPrice, totalCost]
        );

        const insertId = (result as any).insertId;

        // Record transaction
        await this.pool.execute(
          'INSERT INTO transactions (portfolio_item_id, type, volume, price, total_amount) VALUES (?, ?, ?, ?, ?)',
          [insertId, 'BUY', volume, buyPrice, totalCost]
        );

        return await this.getPortfolioItem(insertId) as PortfolioItem;
      }
    } catch (error) {
      console.error('Error buying stock:', error);
      throw error;
    }
  }

  // Sell stocks
  async sellStock(sellRequest: { id: number; volume: number; sellPrice: number }): Promise<{ success: boolean; remainingVolume?: number; soldAmount?: number }> {
    try {
      const { id, volume, sellPrice } = sellRequest;
      const soldAmount = volume * sellPrice;

      // Get current position
      const item = await this.getPortfolioItem(id);
      if (!item) {
        throw new Error('Portfolio item not found');
      }

      if (item.volume < volume) {
        throw new Error('Insufficient shares to sell');
      }

      const remainingVolume = item.volume - volume;

      if (remainingVolume === 0) {
        // Sell all shares - delete the position
        await this.pool.execute('DELETE FROM portfolio_items WHERE id = ?', [id]);
      } else {
        // Update remaining position
        const newTotalCost = (item.totalCost || 0) * (remainingVolume / item.volume);
        const newAverageBuyPrice = newTotalCost / remainingVolume;
        await this.pool.execute(
          `UPDATE portfolio_items 
           SET volume = ?, total_cost = ?, average_buy_price = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [remainingVolume, newTotalCost, newAverageBuyPrice, id]
        );
      }

      // Record transaction
      await this.pool.execute(
        'INSERT INTO transactions (portfolio_item_id, type, volume, price, total_amount) VALUES (?, ?, ?, ?, ?)',
        [id, 'SELL', volume, sellPrice, soldAmount]
      );

      return {
        success: true,
        remainingVolume: remainingVolume,
        soldAmount: soldAmount
      };
    } catch (error) {
      console.error('Error selling stock:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(itemId?: number): Promise<any[]> {
    try {
      let query = `
        SELECT t.*, p.stock_ticker 
        FROM transactions t 
        JOIN portfolio_items p ON t.portfolio_item_id = p.id
        ORDER BY t.timestamp DESC
      `;
      
      if (itemId) {
        query = `
          SELECT t.*, p.stock_ticker 
          FROM transactions t 
          JOIN portfolio_items p ON t.portfolio_item_id = p.id
          WHERE t.portfolio_item_id = ?
          ORDER BY t.timestamp DESC
        `;
      }

      const [rows] = await this.pool.execute(query, itemId ? [itemId] : []);
      
      return (rows as any[]).map(row => ({
        id: row.id,
        portfolioItemId: row.portfolio_item_id,
        stockTicker: row.stock_ticker,
        type: row.type,
        volume: row.volume,
        price: parseFloat(row.price),
        totalAmount: parseFloat(row.total_amount),
        timestamp: new Date(row.timestamp)
      }));
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  // Update profit/loss calculations
  async updateProfitLoss(id: number, currentPrice: number): Promise<void> {
    try {
      const item = await this.getPortfolioItem(id);
      if (!item) return;

      const totalValue = item.volume * currentPrice;
      const profitLoss = totalValue - (item.totalCost || 0);
      const profitLossPercent = item.totalCost ? (profitLoss / item.totalCost) * 100 : 0;

      await this.pool.execute(
        `UPDATE portfolio_items 
         SET current_price = ?, total_value = ?, profit_loss = ?, profit_loss_percent = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [currentPrice, totalValue, profitLoss, profitLossPercent, id]
      );
    } catch (error) {
      console.error('Error updating profit/loss:', error);
      throw error;
    }
  }

  // Get database statistics
  async getStats(): Promise<{ totalItems: number; totalValue: number; totalCost: number; totalProfitLoss: number }> {
    try {
      const [rows] = await this.pool.execute(
        `SELECT 
          COUNT(*) as totalItems, 
          COALESCE(SUM(total_value), 0) as totalValue,
          COALESCE(SUM(total_cost), 0) as totalCost,
          COALESCE(SUM(profit_loss), 0) as totalProfitLoss
         FROM portfolio_items`
      );
      
      const stats = (rows as any[])[0];
      return {
        totalItems: stats.totalItems,
        totalValue: parseFloat(stats.totalValue),
        totalCost: parseFloat(stats.totalCost),
        totalProfitLoss: parseFloat(stats.totalProfitLoss)
      };
    } catch (error) {
      console.error('Error fetching database stats:', error);
      throw error;
    }
  }
} 