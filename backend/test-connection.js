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
    
    // Check if our table exists
    const [tables] = await connection.execute('SHOW TABLES LIKE "portfolio_items"');
    if (tables.length > 0) {
      console.log('✅ portfolio_items table exists');
      
      // Show table structure
      const [columns] = await connection.execute('DESCRIBE portfolio_items');
      console.log('📋 Table structure:', columns.map(col => `${col.Field} (${col.Type})`).join(', '));
      
      // Count records
      const [count] = await connection.execute('SELECT COUNT(*) as count FROM portfolio_items');
      console.log(`📊 Current records: ${count[0].count}`);
    } else {
      console.log('⚠️  portfolio_items table does not exist - will be created automatically');
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