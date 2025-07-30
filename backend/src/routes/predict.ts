import express from 'express';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';
import mysql from 'mysql2/promise';

const router = express.Router();

// Database connection
async function getDbConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'portfolio_manager',
  });
}

// Get historical stock data from Yahoo Finance
async function fetchStockData(ticker: string): Promise<number[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=3mo`;
    const response = await axios.get(url);
    const data = response.data;

    if (!data.chart || !data.chart.result || !data.chart.result[0]) {
      console.error('No chart data available for', ticker);
      return [];
    }

    const result = data.chart.result[0];
    const quotes = result.indicators.quote[0];
    const closes = quotes.close;

    if (!closes || closes.length === 0) {
      console.error('No close prices available for', ticker);
      return [];
    }

    const validCloses = closes.filter((price: number) => price !== null);
    return validCloses.slice(-100);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return [];
  }
}

// Get current stock price from Yahoo Finance
async function fetchCurrentStockPrice(ticker: string): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    const response = await axios.get(url);
    const data = response.data;

    if (!data.chart || !data.chart.result || !data.chart.result[0]) {
      console.error('No chart data available for', ticker);
      return null;
    }

    const result = data.chart.result[0];
    const quotes = result.indicators.quote[0];
    const closes = quotes.close;

    if (!closes || closes.length === 0 || closes[closes.length - 1] === null) {
      console.error('No current price available for', ticker);
      return null;
    }

    return closes[closes.length - 1];
  } catch (error) {
    console.error('Error fetching stock price:', error);
    return null;
  }
}

// Normalize data
function normalizeData(data: number[]): number[] {
  const min = Math.min(...data);
  const max = Math.max(...data);

  if (min === max) {
    console.error('Warning: Data has no variation (min === max)');
    return data.map(() => 0);
  }

  return data.map(value => (value - min) / (max - min));
}

// Denormalize data
function denormalizeData(normalizedValue: number, originalData: number[]): number {
  const min = Math.min(...originalData);
  const max = Math.max(...originalData);
  return normalizedValue * (max - min) + min;
}

// Generate LSTM training data
function generateLSTMData(data: number[], windowSize: number) {
  const inputs: number[][] = [];
  const outputs: number[] = [];

  for (let i = windowSize; i < data.length; i++) {
    const input = data.slice(i - windowSize, i);
    const output = data[i];
    inputs.push(input);
    outputs.push(output);
  }

  return { inputs, outputs };
}

// Train the LSTM model
async function trainLSTMModel(stockData: number[]) {
  const windowSize = 10;
  const normalizedData = normalizeData(stockData);
  const { inputs, outputs } = generateLSTMData(normalizedData, windowSize);

  if (inputs.length < 5) {
    throw new Error('Insufficient data for training');
  }

  const X = tf.tensor(inputs).reshape([inputs.length, windowSize, 1]);
  const Y = tf.tensor(outputs).reshape([outputs.length, 1]);

  const model = tf.sequential();

  model.add(tf.layers.lstm({
    units: 50,
    activation: 'relu',
    inputShape: [windowSize, 1],
    returnSequences: false,
  }));

  model.add(tf.layers.dropout({ rate: 0.2 }));

  model.add(tf.layers.dense({ units: 25, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1 }));

  model.compile({ 
    optimizer: tf.train.adam(0.001), 
    loss: 'meanSquaredError' 
  });

  await model.fit(X, Y, { 
    epochs: 30,
    batchSize: 16,
    validationSplit: 0.2,
    verbose: 0
  });

  return model;
}

// Predict using the trained LSTM model
async function predictWithLSTMModel(model: tf.LayersModel, stockData: number[]) {
  const windowSize = 10;
  const lastData = stockData.slice(-windowSize);
  
  const normalizedLastData = normalizeData(lastData);
  const inputTensor = tf.tensor([normalizedLastData]).reshape([1, windowSize, 1]);

  const prediction = model.predict(inputTensor) as tf.Tensor;
  const predictedPriceNormalized = prediction.dataSync()[0];

  return denormalizeData(predictedPriceNormalized, stockData);
}

// Get tickers from database or use default ones
async function fetchTickersFromDatabase(): Promise<string[]> {
  return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
}

// Create a new prediction task
async function createPredictionTask(taskName: string): Promise<number> {
  const connection = await getDbConnection();
  try {
    const [result] = await connection.execute(
      'INSERT INTO prediction_tasks (task_name, status) VALUES (?, ?)',
      [taskName, 'training']
    );
    return (result as any).insertId;
  } finally {
    await connection.end();
  }
}

// Update prediction task
async function updatePredictionTask(taskId: number, status: string, results?: any) {
  const connection = await getDbConnection();
  try {
    if (status === 'completed') {
      await connection.execute(
        'UPDATE prediction_tasks SET status = ?, results = ?, completed_at = NOW() WHERE id = ?',
        [status, JSON.stringify(results), taskId]
      );
    } else {
      await connection.execute(
        'UPDATE prediction_tasks SET status = ? WHERE id = ?',
        [status, taskId]
      );
    }
  } finally {
    await connection.end();
  }
}

// Main function to predict stock prices
async function predict(taskId: number) {
  console.log(`Starting prediction task ${taskId}...`);
  
  const tickers = await fetchTickersFromDatabase();
  const predictions: Array<{ticker: string, predictedPrice: number, currentPrice: number}> = [];

  for (const ticker of tickers) {
    console.log(`Fetching data for ticker: ${ticker}`);
    
    try {
      const historicalData = await fetchStockData(ticker);
      const currentPrice = await fetchCurrentStockPrice(ticker);

      if (historicalData.length === 0 || currentPrice === null) {
        console.error(`No data available for ${ticker}`);
        continue;
      }

      if (historicalData.length < 20) {
        console.error(`Insufficient historical data for ${ticker}`);
        continue;
      }

      console.log(`Training model for ${ticker} with ${historicalData.length} data points`);
      
      const model = await trainLSTMModel(historicalData);
      const predictedPrice = await predictWithLSTMModel(model, historicalData);

      predictions.push({
        ticker,
        predictedPrice: Math.round(predictedPrice * 100) / 100,
        currentPrice: Math.round(currentPrice * 100) / 100
      });

      console.log(`${ticker}: Current $${currentPrice}, Predicted $${predictedPrice}`);
      
      model.dispose();
      
    } catch (error) {
      console.error(`Error predicting for ${ticker}:`, error);
    }
  }

  const result = { predictions };
  console.log(`Prediction task ${taskId} completed:`, result);
  return result;
}

// GET /api/predict/tasks - Get all prediction tasks
router.get('/tasks', async (req, res) => {
  try {
    const connection = await getDbConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, task_name, status, created_at, completed_at FROM prediction_tasks ORDER BY created_at DESC LIMIT 10'
      );
      res.json({ tasks: rows });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch prediction tasks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/predict/tasks/:id - Get specific task with results
router.get('/tasks/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const connection = await getDbConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM prediction_tasks WHERE id = ?',
        [taskId]
      );
      
      if ((rows as any[]).length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      const task = (rows as any[])[0];
      if (task.results && typeof task.results === 'string') {
        task.results = JSON.parse(task.results);
      }
      
      res.json({ task });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ 
      error: 'Failed to fetch task',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/predict - Start new prediction
router.post('/', async (req, res) => {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const taskName = `Stock Prediction ${timestamp}`;
    
    const taskId = await createPredictionTask(taskName);
    
    // Start prediction in background
    (async () => {
      try {
        const result = await predict(taskId);
        await updatePredictionTask(taskId, 'completed', result);
      } catch (error) {
        console.error(`Prediction task ${taskId} failed:`, error);
        await updatePredictionTask(taskId, 'failed');
      }
    })();
    
    res.json({ 
      taskId,
      taskName,
      status: 'training',
      message: 'Prediction task started'
    });
  } catch (error) {
    console.error('Error starting prediction:', error);
    res.status(500).json({ 
      error: 'Failed to start prediction',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 