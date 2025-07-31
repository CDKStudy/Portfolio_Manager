import axios from 'axios';

interface DouBaoRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model: string;
  stream: boolean;
  temperature: number;
  max_tokens: number;
  top_p?: number;
}

interface DouBaoResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class AIService {
  private readonly apiKey: string;
  private readonly modelId: string;
  private readonly baseURL: string;

  constructor() {
    // doubao api key
    this.apiKey = process.env.DOUBAO_API_KEY || '';
    this.modelId = process.env.DOUBAO_MODEL_ID || '';
    // use volcengine api domain
    this.baseURL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
  }

  async chat(message: string, portfolioContext?: any): Promise<string> {
    // if api key is default value, use mock response
    if (this.apiKey === 'your-api-key' || !this.apiKey) {
      console.log('Using mock response (no API key configured)');
      return this.getMockResponse(message);
    }

    try {
      // build system prompt, include portfolio context
      const systemPrompt = this.buildSystemPrompt(portfolioContext);
      
      const requestBody: DouBaoRequest = {
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        model: this.modelId,
        stream: false,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9
      };

      const response = await axios.post<DouBaoResponse>(
        this.baseURL,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 seconds timeout
        }
      );

      // check response format
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      } else {
        console.error('Invalid API response format:', response.data);
        return this.getMockResponse(message);
      }
    } catch (error) {
      console.error('DouBao API Error:', error);
      console.log('Falling back to mock response');
      return this.getMockResponse(message);
    }
  }

  private buildSystemPrompt(portfolioContext?: any): string {
    let prompt = `You are an AI Portfolio Assistant, a financial advisor AI that helps users with investment decisions and portfolio analysis. 

Your capabilities include:
- Portfolio performance analysis
- Investment recommendations
- Risk assessment
- Market trend analysis
- Rebalancing strategies
- Financial education

Guidelines:
1. Always provide helpful, accurate financial advice
2. Be conversational but professional
3. Use markdown formatting for better readability
4. Include specific recommendations when possible
5. Consider the user's portfolio context when available
6. Be cautious about risk and always recommend diversification
7. Provide actionable insights`;

    if (portfolioContext) {
      prompt += `\n\nCurrent Portfolio Context:
- Total Net Worth: $${portfolioContext.netWorth || 'N/A'}
- Total Invested Assets: $${portfolioContext.totalValue || 'N/A'}
- Cash Balance: $${portfolioContext.cash || 'N/A'}
- Stock Holdings: $${portfolioContext.stockValue || 'N/A'} (${portfolioContext.stockPercentage || 0}%)
- Fund Holdings: $${portfolioContext.fundValue || 'N/A'} (${portfolioContext.fundPercentage || 0}%)
- Cash Percentage: ${portfolioContext.cashPercentage || 0}%
- Total Holdings: ${portfolioContext.totalItems || 0} items

Asset Allocation Analysis:
- Stocks: ${portfolioContext.stockPercentage || 0}% of invested assets
- Funds: ${portfolioContext.fundPercentage || 0}% of invested assets
- Cash: ${portfolioContext.cashPercentage || 0}% of total net worth

Use this detailed context to provide personalized investment advice, risk assessment, and rebalancing recommendations. Consider the current asset allocation when making suggestions.`;
    }

    return prompt;
  }

    // mock response (for testing or api unavailable)
  async getMockResponse(message: string): Promise<string> {
    const responses = {
      'portfolio performance': 'Based on your portfolio data, I can analyze your current asset allocation and performance. I can see your total net worth, stock and fund holdings, and cash position. Would you like me to provide a detailed analysis of your portfolio performance, including risk assessment and growth potential?',
      'invest': 'Looking at your current portfolio allocation, I can provide personalized investment recommendations based on your specific holdings and risk profile. I can suggest:\n\n1. **Diversification opportunities** - Based on your current asset mix\n2. **Growth investments** - Stocks and funds for capital appreciation\n3. **Income investments** - Dividend-paying stocks and bond funds\n4. **International exposure** - For geographic diversification\n\nWould you like specific recommendations based on your current allocation?',
      'risk': 'I can assess your portfolio risk based on your current asset allocation. Let me analyze:\n\n• **Stock allocation** - Your current equity exposure\n• **Fund allocation** - Your fund holdings and their risk profile\n• **Cash position** - Your liquidity and safety buffer\n• **Overall diversification** - How well your portfolio is spread\n\nWould you like a detailed risk assessment?',
      'market': 'Current market analysis:\n\n📈 **Bullish indicators**:\n• Strong earnings growth\n• Low unemployment\n• Fed policy support\n\n⚠️ **Risks to watch**:\n• Inflation concerns\n• Geopolitical tensions\n• Interest rate changes\n\nI recommend staying diversified and dollar-cost averaging based on your current portfolio.',
      'rebalancing': 'Based on your current portfolio allocation, I can provide rebalancing recommendations to optimize your asset mix. I can suggest:\n\n1. **Asset allocation adjustments** - Based on your current stock/fund/cash split\n2. **Risk management** - Adjusting exposure based on market conditions\n3. **Diversification improvements** - Adding missing asset classes\n4. **Cash management** - Optimizing your liquidity position\n\nWould you like a personalized rebalancing plan?'
    };

    const lowerMessage = message.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    return 'I\'m here to help with your portfolio analysis and investment decisions. I can provide insights on:\n\n• Portfolio performance analysis\n• Investment recommendations\n• Risk assessment\n• Market trends\n• Rebalancing strategies\n\nWhat specific aspect would you like to discuss?';
  }
}

export default new AIService(); 