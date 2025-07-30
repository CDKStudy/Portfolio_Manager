const axios = require('axios');
const tf = require('@tensorflow/tfjs');  // use TensorFlow.js
const mysql = require('mysql2/promise'); // MySQL client for database interaction

// API
const API_KEY = '3EQBA5O3TQDE00OC';
// const API_KEY = 'SVOUZ0Y1W3J7M758';
// const API_KEY = 'HCA13R1K7S5R81EI';

// Get 30-days stock data from Alpha Vantage
async function fetchStockData(ticker) {
  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${API_KEY}&outputsize=compact`;
    const response = await axios.get(url);
    const data = response.data;

    if (data['Error Message']) {
      console.error('Error fetching stock data:', data['Error Message']);
      return [];
    }

    const stockData = Object.values(data['Time Series (Daily)']).map(dayData => parseFloat(dayData['4. close']));
    return stockData;
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    return [];
  }
}

// Normalize data
function normalizeData(data) {
  const min = Math.min(...data);
  const max = Math.max(...data);

  if (min === max) {
    console.error('Warning: Data has no variation (min === max)');
    return data.map(() => 0);
  }

  return data.map(value => (value - min) / (max - min)); // Normalize data to [0, 1]
}

// Denormalize data
function denormalizeData(normalizedValue, originalData) {
  const min = Math.min(...originalData);
  const max = Math.max(...originalData);
  return normalizedValue * (max - min) + min;
}

// Generate LSTM training data
function generateLSTMData(data, windowSize) {
  const inputs = [];
  const outputs = [];

  for (let i = windowSize; i < data.length; i++) {
    const input = data.slice(i - windowSize, i);  // Last `windowSize` days data
    const output = data[i];  // Current day's data as the output
    inputs.push(input);
    outputs.push(output);
  }

  return { inputs, outputs };
}

// Train the LSTM model
async function trainLSTMModel(stockData) {
  const windowSize = 5; // Use the last 5 days' data for prediction
  const normalizedData = normalizeData(stockData);
  const { inputs, outputs } = generateLSTMData(normalizedData, windowSize);

  const X = tf.tensor(inputs).reshape([inputs.length, windowSize, 1]);
  const Y = tf.tensor(outputs).reshape([outputs.length, 1]);

  const model = tf.sequential();

  model.add(tf.layers.lstm({
    units: 50,
    activation: 'relu',
    inputShape: [windowSize, 1],
    returnSequences: false,
  }));

  model.add(tf.layers.dense({ units: 1 }));

  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

  await model.fit(X, Y, { epochs: 100, batchSize: 32 });

  return model;
}

// Predict using the trained LSTM model
async function predictWithLSTMModel(model, stockData) {
  const windowSize = 5;
  const lastData = stockData.slice(-windowSize);  // Get last 5 days' stock prices
  
  const normalizedLastData = normalizeData(lastData);
  const inputTensor = tf.tensor([normalizedLastData]).reshape([1, windowSize, 1]);

  const prediction = model.predict(inputTensor);
  const predictedPriceNormalized = prediction.dataSync()[0];

  return denormalizeData(predictedPriceNormalized, stockData);
}

// Fetch tickers from the database
async function fetchTickersFromDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'portfolio_manager',
  });

  const [rows] = await connection.execute("SELECT ticker FROM holdings WHERE type = 'stock'");
  await connection.end();
  return rows.map(row => row.ticker);
}

// Main function to predict stock prices
async function predict() {
  const tickers = await fetchTickersFromDatabase();
  const predictions = [];

  for (const ticker of tickers) {
    console.log(`Fetching data for ticker: ${ticker}`);
    const stockData = await fetchStockData(ticker);

    if (stockData.length === 0) {
      console.error(`No stock data available for ${ticker}`);
      continue;
    }

    const model = await trainLSTMModel(stockData);
    const predictedPrice = await predictWithLSTMModel(model, stockData);

    predictions.push({
      ticker,
      predictedPrice
    });
  }

  // Return predictions as JSON for the frontend
  return { predictions };
}

// API endpoint
const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/predict', async (req, res) => {
  try {
    const result = await predict();
    res.json(result);
  } catch (error) {
    console.error('Error in prediction process:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start the server
const port = 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});