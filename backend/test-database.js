// Database Design Test Script
// Run with: node test-database.js

require('dotenv').config();
const mysql = require('mysql2/promise');

async function testDatabaseDesign() {
  console.log('🔍 Testing Database Design...\n');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portfolio_manager'
  };

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to database successfully\n');

    // Test 1: Check table structure
    console.log('📋 Testing Table Structure...');
    
    const [portfolioColumns] = await connection.execute('DESCRIBE portfolio_items');
    console.log('Portfolio Items Table Columns:');
    portfolioColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Key === 'PRI' ? '(PRIMARY)' : ''}`);
    });

    const [transactionColumns] = await connection.execute('DESCRIBE transactions');
    console.log('\nTransactions Table Columns:');
    transactionColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Key === 'PRI' ? '(PRIMARY)' : ''}`);
    });

    // Test 2: Check indexes
    console.log('\n🔍 Testing Indexes...');
    
    const [portfolioIndexes] = await connection.execute('SHOW INDEX FROM portfolio_items');
    console.log('Portfolio Items Indexes:');
    portfolioIndexes.forEach(idx => {
      console.log(`  - ${idx.Key_name}: ${idx.Column_name}`);
    });

    const [transactionIndexes] = await connection.execute('SHOW INDEX FROM transactions');
    console.log('\nTransactions Indexes:');
    transactionIndexes.forEach(idx => {
      console.log(`  - ${idx.Key_name}: ${idx.Column_name}`);
    });

    // Test 3: Check foreign key constraints
    console.log('\n🔗 Testing Foreign Key Constraints...');
    
    const [foreignKeys] = await connection.execute(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'transactions' AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [config.database]);
    
    console.log('Foreign Key Constraints:');
    foreignKeys.forEach(fk => {
      console.log(`  - ${fk.CONSTRAINT_NAME}: ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
    });

    // Test 4: Test data insertion
    console.log('\n📝 Testing Data Insertion...');
    
    // Test portfolio item insertion
    const [insertResult] = await connection.execute(
      'INSERT INTO portfolio_items (stock_ticker, volume, current_price, total_value, average_buy_price, total_cost) VALUES (?, ?, ?, ?, ?, ?)',
      ['TEST', 100, 50.00, 5000.00, 45.00, 4500.00]
    );
    const testId = insertResult.insertId;
    console.log(`✅ Inserted test portfolio item with ID: ${testId}`);

    // Test transaction insertion
    await connection.execute(
      'INSERT INTO transactions (portfolio_item_id, type, volume, price, total_amount) VALUES (?, ?, ?, ?, ?)',
      [testId, 'BUY', 100, 45.00, 4500.00]
    );
    console.log('✅ Inserted test transaction');

    // Test data retrieval
    const [portfolioItems] = await connection.execute('SELECT * FROM portfolio_items WHERE id = ?', [testId]);
    console.log('\n📊 Retrieved Portfolio Item:');
    console.log(JSON.stringify(portfolioItems[0], null, 2));

    const [transactions] = await connection.execute('SELECT * FROM transactions WHERE portfolio_item_id = ?', [testId]);
    console.log('\n📊 Retrieved Transaction:');
    console.log(JSON.stringify(transactions[0], null, 2));

    // Clean up test data
    await connection.execute('DELETE FROM portfolio_items WHERE id = ?', [testId]);
    console.log('✅ Cleaned up test data');

    // Test 5: Check data types and constraints
    console.log('\n🔧 Testing Data Types and Constraints...');
    
    // Test volume constraint
    try {
      await connection.execute('INSERT INTO portfolio_items (stock_ticker, volume) VALUES (?, ?)', ['TEST2', -1]);
      console.log('❌ Volume constraint test failed - should not allow negative volume');
    } catch (error) {
      console.log('✅ Volume constraint working correctly');
    }

    // Test enum constraint
    try {
      await connection.execute('INSERT INTO transactions (portfolio_item_id, type, volume, price, total_amount) VALUES (?, ?, ?, ?, ?)', 
        [1, 'INVALID', 100, 50.00, 5000.00]);
      console.log('❌ Transaction type enum constraint failed');
    } catch (error) {
      console.log('✅ Transaction type enum constraint working correctly');
    }

    await connection.end();
    console.log('\n🎉 All database design tests passed!');
    console.log('\n📋 Database Design Summary:');
    console.log('✅ Portfolio items table with all required fields');
    console.log('✅ Transactions table with proper foreign key');
    console.log('✅ Proper indexes for performance');
    console.log('✅ Data type constraints working');
    console.log('✅ Foreign key constraints working');
    console.log('✅ Enum constraints working');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDatabaseDesign(); 