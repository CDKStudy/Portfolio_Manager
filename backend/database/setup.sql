-- Portfolio Manager Database Schema
-- Created: 2025-01-28

-- Drop existing tables if they exist
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS holdings;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    cash DECIMAL(18,2) DEFAULT 0.00,
    net_worth DECIMAL(18,2) DEFAULT 0.00
);

-- Holdings table (portfolio_holdings)
CREATE TABLE holdings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('stock', 'fund', 'cash') NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    quantity DECIMAL(18,4) NOT NULL,
    buy_price DECIMAL(18,4) NOT NULL,
    buy_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    asset_type ENUM('stock', 'fund', 'cash') NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    action ENUM('buy', 'sell') NOT NULL,
    quantity DECIMAL(18,4) NOT NULL,
    price DECIMAL(18,4) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample user
INSERT INTO users (username, cash, net_worth) VALUES ('john_doe', 10000.00, 45231.89);

-- Insert sample holdings
INSERT INTO holdings (type, ticker, quantity, buy_price, user_id) VALUES
('stock', 'AAPL', 10.0000, 150.0000, 1),
('stock', 'MSFT', 5.0000, 300.0000, 1),
('stock', 'GOOGL', 8.0000, 180.0000, 1),
('fund', '510300', 1000.0000, 3.5000, 1);

-- Insert sample transactions
INSERT INTO transactions (user_id, asset_type, ticker, action, quantity, price) VALUES
(1, 'stock', 'AAPL', 'buy', 10.0000, 150.0000),
(1, 'stock', 'MSFT', 'buy', 5.0000, 300.0000),
(1, 'stock', 'GOOGL', 'buy', 8.0000, 180.0000),
(1, 'fund', '510300', 'buy', 1000.0000, 3.5000);


-- Prediction tasks table
CREATE TABLE IF NOT EXISTS prediction_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    status ENUM('training', 'completed', 'failed') NOT NULL DEFAULT 'training',
    results JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status_date (status, created_at DESC)
);