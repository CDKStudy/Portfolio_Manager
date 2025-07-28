-- MySQL Database Setup Script for Portfolio Manager
-- Run this script to manually create the database and tables

-- Create database
CREATE DATABASE IF NOT EXISTS portfolio_manager
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE portfolio_manager;

-- Create portfolio_items table
CREATE TABLE IF NOT EXISTS portfolio_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stock_ticker VARCHAR(10) NOT NULL,
  volume INT NOT NULL CHECK (volume > 0),
  current_price DECIMAL(10, 2) DEFAULT NULL,
  total_value DECIMAL(15, 2) DEFAULT NULL,
  average_buy_price DECIMAL(10, 2) DEFAULT NULL,
  total_cost DECIMAL(15, 2) DEFAULT NULL,
  profit_loss DECIMAL(15, 2) DEFAULT NULL,
  profit_loss_percent DECIMAL(10, 4) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for better performance
  INDEX idx_stock_ticker (stock_ticker),
  INDEX idx_created_at (created_at),
  INDEX idx_total_value (total_value),
  INDEX idx_profit_loss (profit_loss)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create transactions table
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
  INDEX idx_timestamp (timestamp),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user for the application (optional, for production use)
-- CREATE USER 'portfolio_user'@'localhost' IDENTIFIED BY 'secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON portfolio_manager.* TO 'portfolio_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Insert sample data (optional)
INSERT INTO portfolio_items (stock_ticker, volume, current_price, total_value, average_buy_price, total_cost) VALUES
  ('AAPL', 100, 175.50, 17550.00, 170.00, 17000.00),
  ('TSLA', 50, 250.00, 12500.00, 240.00, 12000.00),
  ('AMZN', 25, 130.00, 3250.00, 125.00, 3125.00)
ON DUPLICATE KEY UPDATE 
  volume = VALUES(volume),
  current_price = VALUES(current_price),
  total_value = VALUES(total_value),
  average_buy_price = VALUES(average_buy_price),
  total_cost = VALUES(total_cost);

-- Show the created tables
SHOW TABLES;

-- Show the structure of portfolio_items table
DESCRIBE portfolio_items;

-- Show the structure of transactions table
DESCRIBE transactions;

-- Display sample data
SELECT * FROM portfolio_items;

-- Display sample transactions (if any)
SELECT * FROM transactions; 