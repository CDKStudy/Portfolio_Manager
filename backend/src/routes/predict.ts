import express from 'express';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';

const router = express.Router();

// Cache for predictions (5 minutes)
let predictionsCache: any = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get historical stock data from Yahoo Finance
async function fetchStockData(ticker: string): Promise<number[]> {
  try {
    // Use Yahoo Finance API instead of Alpha Vantage
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=3mo`;
    const response = await axios.get(url);
    const data = response.data;

    if (!data.chart || !data.chart.result || !data.chart.result[0]) {
      console.error('No chart data available for', ticker);
      return [];
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    const closes = quotes.close;

    if (!closes || closes.length === 0) {
      console.error('No close prices available for', ticker);
      return [];
    }

    // Filter out null values and get the last 100 days
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
  const windowSize = 10; // Use the last 10 days' data for prediction
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
    epochs: 30, // Reduced epochs for faster training
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

// Mock function to get tickers (for now, return some popular stocks)
async function fetchTickersFromDatabase(): Promise<string[]> {
  // For now, return some popular stocks
  // In a real implementation, this would query the database
  return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
}

// Main function to predict stock prices
async function predict() {
  // Check cache first
  const now = Date.now();
  if (predictionsCache && (now - lastCacheTime) < CACHE_DURATION) {
    console.log('Returning cached predictions');
    return predictionsCache;
  }

  console.log('Starting new prediction process...');
  
  const tickers = await fetchTickersFromDatabase();
  const predictions: Array<{ticker: string, predictedPrice: number, currentPrice: number}> = [];

  for (const ticker of tickers) {
    console.log(`Fetching data for ticker: ${ticker}`);
    
    try {
      // Get historical data for training
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
      
      // Train the model
      const model = await trainLSTMModel(historicalData);
      
      // Make prediction
      const predictedPrice = await predictWithLSTMModel(model, historicalData);

      predictions.push({
        ticker,
        predictedPrice: Math.round(predictedPrice * 100) / 100,
        currentPrice: Math.round(currentPrice * 100) / 100
      });

      console.log(`${ticker}: Current $${currentPrice}, Predicted $${predictedPrice}`);
      
      // Clean up model to free memory
      model.dispose();
      
    } catch (error) {
      console.error(`Error predicting for ${ticker}:`, error);
    }
  }

  const result = { predictions };
  
  // Cache the result
  predictionsCache = result;
  lastCacheTime = now;
  
  console.log('Prediction completed and cached:', result);
  return result;
}

// GET /api/predict
router.get('/', async (req, res) => {
  try {
    const result = await predict();
    res.json(result);
  } catch (error) {
    console.error('Error in prediction process:', error);
    res.status(500).json({ 
      error: 'Failed to generate predictions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 