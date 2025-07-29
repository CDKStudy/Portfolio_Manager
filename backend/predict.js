const axios = require('axios');
const tf = require('@tensorflow/tfjs');  // use TensorFlow.js

// API
// const API_KEY = 'GBTP0IF0JKYSFFF9';
const API_KEY = 'SVOUZ0Y1W3J7M758';

// get 30-days data
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
    console.log('Fetched Stock Data:', stockData);  // 输出原始股价数据
    return stockData;
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    return [];
  }
}

// 数据归一化
function normalizeData(data) {
  const min = Math.min(...data);
  const max = Math.max(...data);

  if (min === max) {
    console.error('Warning: Data has no variation (min === max)');
    return data.map(() => 0);  // 如果数据没有变化，将所有数据归一化为0
  }

  return data.map(value => (value - min) / (max - min));  // 将数据归一化到[0,1]
}

// 反归一化
function denormalizeData(normalizedValue, originalData) {
  const min = Math.min(...originalData);
  const max = Math.max(...originalData);
  return normalizedValue * (max - min) + min;  // 将归一化数据反归一化
}

// 生成 LSTM 所需的训练数据
function generateLSTMData(data, windowSize) {
  const inputs = [];
  const outputs = [];
  
  for (let i = windowSize; i < data.length; i++) {
    const input = data.slice(i - windowSize, i);  // 过去 `windowSize` 天的数据
    const output = data[i];  // 当前天的数据作为输出
    inputs.push(input);
    outputs.push(output);
  }

  return { inputs, outputs };
}

// 训练 LSTM 模型
async function trainLSTMModel(stockData) {
  const windowSize = 5;  // 使用过去5天的数据来预测
  const normalizedData = normalizeData(stockData);
  
  // 生成训练数据
  const { inputs, outputs } = generateLSTMData(normalizedData, windowSize);

  // 将输入数据转为 TensorFlow 张量
  const X = tf.tensor(inputs).reshape([inputs.length, windowSize, 1]);
  const Y = tf.tensor(outputs).reshape([outputs.length, 1]);

  // 创建 LSTM 模型
  const model = tf.sequential();

  // 添加 LSTM 层
  model.add(tf.layers.lstm({
    units: 50,
    activation: 'relu',
    inputShape: [windowSize, 1],
    returnSequences: false,
  }));

  // 添加全连接层
  model.add(tf.layers.dense({ units: 1 }));

  // 编译模型
  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

  // 训练模型
  await model.fit(X, Y, { epochs: 100, batchSize: 32 });

  return model;
}

// 使用训练好的模型进行预测
async function predictWithLSTMModel(model, stockData) {
  const windowSize = 5;  // 使用过去5天的数据来预测
  const lastData = stockData.slice(-windowSize);  // 取最后5天的股价数据作为输入
  
  const normalizedLastData = normalizeData(lastData);  // 归一化数据
  const inputTensor = tf.tensor([normalizedLastData]).reshape([1, windowSize, 1]);  // 转为 TensorFlow 张量
  
  // 进行预测
  const prediction = model.predict(inputTensor);
  const predictedPriceNormalized = prediction.dataSync()[0];  // 获取预测结果
  
  // 反归一化预测值
  const predictedPrice = denormalizeData(predictedPriceNormalized, stockData);
  
  console.log('Predicted stock price for the next day:', predictedPrice);
}

// 主函数，训练并预测
async function predict() {
  const ticker = 'MSFT';  // 你可以修改为任何股票代码，例如 'AAPL', 'MSFT'
  
  const stockData = await fetchStockData(ticker);
  if (stockData.length === 0) {
    console.error('No stock data available');
    return;
  }
  
  const model = await trainLSTMModel(stockData);  // 训练 LSTM 模型
  await predictWithLSTMModel(model, stockData);   // 使用训练好的模型进行预测
}

// 执行预测函数
predict();
