import mysql from 'mysql2/promise';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface User {
  id: number;
  username: string;
  cash: number;
  netWorth: number;
}

export interface Holding {
  id: number;
  type: 'stock' | 'fund';
  ticker: string;
  quantity: number;
  buyPrice: number;
  buyDate: Date;
  userId: number;
}

export interface Transaction {
  id: number;
  userId: number;
  assetType: 'stock' | 'fund' | 'cash';
  ticker: string;
  action: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: Date;
}

export interface CreateHoldingRequest {
  type: 'stock' | 'fund';
  ticker: string;
  quantity: number;
  buyPrice: number;
  userId: number;
}

export interface CreateTransactionRequest {
  userId: number;
  assetType: 'stock' | 'fund' | 'cash';
  ticker: string;
  action: 'buy' | 'sell';
  quantity: number;
  price: number;
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
      // First, create database if it doesn't exist
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

      // Create tables
      const connection = await this.pool.getConnection();
      
      // Users table
      const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          username VARCHAR(50) UNIQUE NOT NULL,
          cash DECIMAL(18,2) DEFAULT 0.00,
          net_worth DECIMAL(18,2) DEFAULT 0.00
        )
      `;

      // Holdings table
      const createHoldingsTableQuery = `
        CREATE TABLE IF NOT EXISTS holdings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          type ENUM('stock', 'fund') NOT NULL,
          ticker VARCHAR(20) NOT NULL,
          quantity DECIMAL(18,4) NOT NULL,
          buy_price DECIMAL(18,4) NOT NULL,
          buy_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          user_id INT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `;

      // Transactions table
      const createTransactionsTableQuery = `
        CREATE TABLE IF NOT EXISTS transactions (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          asset_type ENUM('stock', 'fund', 'cash') NOT NULL,
          ticker VARCHAR(20) NOT NULL,
          action ENUM('buy', 'sell') NOT NULL,
          quantity DECIMAL(18,4) NOT NULL,
          price DECIMAL(18,4) NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `;

      await connection.execute(createUsersTableQuery);
      await connection.execute(createHoldingsTableQuery);
      await connection.execute(createTransactionsTableQuery);
      connection.release();
      
      console.log('MySQL database initialized successfully');
    } catch (error) {
      console.error('Error initializing MySQL database:', error);
      throw error;
    }
  }

  // User operations
  async getUser(userId: number): Promise<User | null> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
      
      const rowArray = rows as any[];
      if (rowArray.length === 0) {
        return null;
      }

      const row = rowArray[0];
      return {
        id: row.id,
        username: row.username,
        cash: parseFloat(row.cash),
        netWorth: parseFloat(row.net_worth)
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async createUser(username: string, cash: number = 0): Promise<User> {
    try {
      const [result] = await this.pool.execute(
        'INSERT INTO users (username, cash, net_worth) VALUES (?, ?, ?)',
        [username, cash, cash]
      );

      const insertId = (result as any).insertId;
      const user = await this.getUser(insertId);
      
      if (!user) {
        throw new Error('Failed to retrieve created user');
      }

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUserCash(userId: number, cash: number): Promise<void> {
    try {
      await this.pool.execute(
        'UPDATE users SET cash = ? WHERE id = ?',
        [cash, userId]
      )
    } catch (error) {
      console.error('Error updating user cash:', error);
      throw error;
    }
  }

  async updateUserNetWorth(userId: number, netWorth: number): Promise<void> {
    try {
      await this.pool.execute(
        'UPDATE users SET net_worth = ? WHERE id = ?',
        [netWorth, userId]
      );
    } catch (error) {
      console.error('Error updating user net worth:', error);
      throw error;
    }
  }

  // Holdings operations
  async getHoldings(userId: number): Promise<Holding[]> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM holdings WHERE user_id = ? ORDER BY buy_date DESC',
        [userId]
      );
      
      return (rows as any[]).map(row => ({
        id: row.id,
        type: row.type,
        ticker: row.ticker,
        quantity: parseFloat(row.quantity),
        buyPrice: parseFloat(row.buy_price),
        buyDate: new Date(row.buy_date),
        userId: row.user_id
      }));
    } catch (error) {
      console.error('Error fetching holdings:', error);
      throw error;
    }
  }

  async getHolding(id: number): Promise<Holding | null> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM holdings WHERE id = ?',
        [id]
      );
      
      const rowArray = rows as any[];
      if (rowArray.length === 0) {
        return null;
      }

      const row = rowArray[0];
      return {
        id: row.id,
        type: row.type,
        ticker: row.ticker,
        quantity: parseFloat(row.quantity),
        buyPrice: parseFloat(row.buy_price),
        buyDate: new Date(row.buy_date),
        userId: row.user_id
      };
    } catch (error) {
      console.error('Error fetching holding:', error);
      throw error;
    }
  }

  async createHolding(holding: CreateHoldingRequest): Promise<Holding> {
    try {
      const [result] = await this.pool.execute(
        'INSERT INTO holdings (type, ticker, quantity, buy_price, user_id) VALUES (?, ?, ?, ?, ?)',
        [holding.type, holding.ticker, holding.quantity, holding.buyPrice, holding.userId]
      );

      const insertId = (result as any).insertId;
      const createdHolding = await this.getHolding(insertId);
      
      if (!createdHolding) {
        throw new Error('Failed to retrieve created holding');
      }

      return createdHolding;
    } catch (error) {
      console.error('Error creating holding:', error);
      throw error;
    }
  }

  async updateHolding(id: number, quantity: number): Promise<Holding | null> {
    try {
      await this.pool.execute(
        'UPDATE holdings SET quantity = ? WHERE id = ?',
        [quantity, id]
      );

      return await this.getHolding(id);
    } catch (error) {
      console.error('Error updating holding:', error);
      throw error;
    }
  }

  async deleteHolding(id: number): Promise<boolean> {
    try {
      const [result] = await this.pool.execute(
        'DELETE FROM holdings WHERE id = ?',
        [id]
      );

      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('Error deleting holding:', error);
      throw error;
    }
  }

  // Transactions operations
  // Get transactions
  async getTransactions(userId: number, limit: number = 50): Promise<Transaction[]> {
    try {
      const [rows] = await this.pool.query(
        'SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?',
        [userId, limit]
      );
      
      return (rows as any[]).map(row => ({
        id: row.id,
        userId: row.user_id,
        assetType: row.asset_type,
        ticker: row.ticker,
        action: row.action,
        quantity: parseFloat(row.quantity),
        price: parseFloat(row.price),
        timestamp: new Date(row.timestamp)
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  // Get cash transactions
  async getCashTransactions(userId: number, limit: number = 20): Promise<Transaction[]> {
    try {
      const [rows] = await this.pool.query(
        'SELECT * FROM transactions WHERE user_id = ? AND asset_type = ? ORDER BY timestamp DESC LIMIT ?',
        [userId, 'cash', limit]
      );
      
      return (rows as any[]).map(row => ({
        id: row.id,
        userId: row.user_id,
        assetType: row.asset_type,
        ticker: row.ticker,
        action: row.action,
        quantity: parseFloat(row.quantity),
        price: parseFloat(row.price),
        timestamp: new Date(row.timestamp)
      }));
    } catch (error) {
      console.error('Error fetching cash transactions:', error);
      throw error;
    }
  }

  async createTransaction(transaction: CreateTransactionRequest): Promise<Transaction> {
    try {
      const [result] = await this.pool.execute(
        'INSERT INTO transactions (user_id, asset_type, ticker, action, quantity, price) VALUES (?, ?, ?, ?, ?, ?)',
        [transaction.userId, transaction.assetType, transaction.ticker, transaction.action, transaction.quantity, transaction.price]
      );

      const insertId = (result as any).insertId;
      
      // Fetch the created transaction
      const [rows] = await this.pool.execute(
        'SELECT * FROM transactions WHERE id = ?',
        [insertId]
      );
      
      const row = (rows as any[])[0];
      return {
        id: row.id,
        userId: row.user_id,
        assetType: row.asset_type,
        ticker: row.ticker,
        action: row.action,
        quantity: parseFloat(row.quantity),
        price: parseFloat(row.price),
        timestamp: new Date(row.timestamp)
      };
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Buy operation
  async buyAsset(userId: number, assetType: 'stock' | 'fund', ticker: string, quantity: number, price: number): Promise<{ success: boolean; holding?: Holding }> {
    try {
      // Check if user has enough cash
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const totalCost = quantity * price;
      if (user.cash < totalCost) {
        throw new Error('Insufficient cash');
      }

      // Check if holding already exists
      const [existingRows] = await this.pool.execute(
        'SELECT * FROM holdings WHERE user_id = ? AND ticker = ? AND type = ?',
        [userId, ticker, assetType]
      );

      if ((existingRows as any[]).length > 0) {
        // Update existing holding
        const existing = (existingRows as any[])[0];
        const newQuantity = parseFloat(existing.quantity) + quantity;
        const newTotalCost = (parseFloat(existing.buy_price) * parseFloat(existing.quantity)) + totalCost;
        const newAveragePrice = newTotalCost / newQuantity;

        await this.pool.execute(
          'UPDATE holdings SET quantity = ?, buy_price = ? WHERE id = ?',
          [newQuantity, newAveragePrice, existing.id]
        );

        // Update user cash
        await this.updateUserCash(userId, user.cash - totalCost);

        // Record transaction
        await this.createTransaction({
          userId,
          assetType,
          ticker,
          action: 'buy',
          quantity,
          price
        });

        const updatedHolding = await this.getHolding(existing.id);
        return { success: true, holding: updatedHolding || undefined };
      } else {
        // Create new holding
        const holding = await this.createHolding({
          type: assetType,
          ticker,
          quantity,
          buyPrice: price,
          userId
        });

        // Update user cash
        await this.updateUserCash(userId, user.cash - totalCost);

        // Record transaction
        await this.createTransaction({
          userId,
          assetType,
          ticker,
          action: 'buy',
          quantity,
          price
        });

        return { success: true, holding };
      }
    } catch (error) {
      console.error('Error buying asset:', error);
      throw error;
    }
  }

  // Sell operation
  async sellAsset(userId: number, assetType: 'stock' | 'fund', ticker: string, quantity: number, price: number): Promise<{ success: boolean; remainingQuantity?: number }> {
    try {
      // Find the holding
      const [holdingRows] = await this.pool.execute(
        'SELECT * FROM holdings WHERE user_id = ? AND ticker = ? AND type = ?',
        [userId, ticker, assetType]
      );

      if ((holdingRows as any[]).length === 0) {
        throw new Error('Holding not found');
      }

      const holding = (holdingRows as any[])[0];
      const currentQuantity = parseFloat(holding.quantity);

      if (currentQuantity < quantity) {
        throw new Error('Insufficient quantity to sell');
      }

      const totalProceeds = quantity * price;
      const remainingQuantity = currentQuantity - quantity;

      // Update user cash
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await this.updateUserCash(userId, user.cash + totalProceeds);

      if (remainingQuantity === 0) {
        // Delete the holding if all sold
        await this.deleteHolding(holding.id);
      } else {
        // Update the holding
        await this.updateHolding(holding.id, remainingQuantity);
      }

      // Record transaction
      await this.createTransaction({
        userId,
        assetType,
        ticker,
        action: 'sell',
        quantity,
        price
      });

      return { success: true, remainingQuantity };
    } catch (error) {
      console.error('Error selling asset:', error);
      throw error;
    }
  }

  // Get portfolio summary
  async getPortfolioSummary(userId: number): Promise<{
    totalHoldings: number;
    totalValue: number;
    totalCost: number;
    totalProfitLoss: number;
    cash: number;
    netWorth: number;
  }> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const holdings = await this.getHoldings(userId);
      
      let totalCost = 0;
      let totalValue = 0;

      for (const holding of holdings) {
        totalCost += holding.quantity * holding.buyPrice;
        // For now, use buy price as current price (should be updated with real market data)
        totalValue += holding.quantity * holding.buyPrice;
      }

      const totalProfitLoss = totalValue - totalCost;
      const netWorth = user.cash + totalValue;

      return {
        totalHoldings: holdings.length,
        totalValue,
        totalCost,
        totalProfitLoss,
        cash: user.cash,
        netWorth
      };
    } catch (error) {
      console.error('Error getting portfolio summary:', error);
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
} 