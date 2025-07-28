// Quick MySQL connection test script
// Run with: node test-connection.js

require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Testing MySQL connection...');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portfolio_manager'
  };

  console.log(`📡 Connecting to: ${config.user}@${config.host}:${config.port}/${config.database}`);

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ MySQL connection successful!');
    
    // Test basic query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful:', rows[0]);
    
    // Check if our tables exist
    const [usersTable] = await connection.execute('SHOW TABLES LIKE "users"');
    const [holdingsTable] = await connection.execute('SHOW TABLES LIKE "holdings"');
    const [transactionsTable] = await connection.execute('SHOW TABLES LIKE "transactions"');
    
    if (usersTable.length > 0) {
      console.log('✅ users table exists');
      
      // Show table structure
      const [columns] = await connection.execute('DESCRIBE users');
      console.log('📋 Users table structure:', columns.map(col => `${col.Field} (${col.Type})`).join(', '));
      
      // Count records
      const [count] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`📊 Users records: ${count[0].count}`);
    } else {
      console.log('⚠️  users table does not exist - will be created automatically');
    }
    
    if (holdingsTable.length > 0) {
      console.log('✅ holdings table exists');
      
      // Count records
      const [count] = await connection.execute('SELECT COUNT(*) as count FROM holdings');
      console.log(`📊 Holdings records: ${count[0].count}`);
    } else {
      console.log('⚠️  holdings table does not exist - will be created automatically');
    }
    
    if (transactionsTable.length > 0) {
      console.log('✅ transactions table exists');
      
      // Count records
      const [count] = await connection.execute('SELECT COUNT(*) as count FROM transactions');
      console.log(`📊 Transactions records: ${count[0].count}`);
    } else {
      console.log('⚠️  transactions table does not exist - will be created automatically');
    }
    
    await connection.end();
    console.log('🎉 All tests passed! Database is ready.');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Ensure MySQL server is running');
    console.log('2. Check your .env file credentials');
    console.log('3. Verify database exists: CREATE DATABASE portfolio_manager;');
    console.log('4. Check user permissions');
    process.exit(1);
  }
}

testConnection(); 