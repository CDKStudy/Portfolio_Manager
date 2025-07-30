import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { Database } from './models/Database';
import portfolioRoutes from './routes/portfolio';
import predictRoutes from './routes/predict';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database connection
const db = new Database();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/predict', predictRoutes);

// Health check with database connectivity
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await db.testConnection();
    res.json({ 
      status: 'OK', 
      message: 'Portfolio Manager API is running',
      database: dbConnected ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 废弃代码
// Database stats endpoint
// app.get('/api/stats', async (req, res) => {
//   try {
//     const stats = await db.getStats();
//     res.json(stats);
//   } catch (error) {
//     res.status(500).json({ 
//       error: 'Failed to fetch statistics',
//       message: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// });


// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await db.close();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Portfolio Manager API is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoints: http://localhost:${PORT}/api/portfolio`);
  console.log(`📈 Statistics: http://localhost:${PORT}/api/stats`);
  console.log(`💾 Database: MySQL`);
});

export default app; 