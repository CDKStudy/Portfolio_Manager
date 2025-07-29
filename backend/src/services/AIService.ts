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
- Total Assets: $${portfolioContext.totalValue || 'N/A'}
- Cash Balance: $${portfolioContext.cash || 'N/A'}
- Number of Holdings: ${portfolioContext.holdingsCount || 0}
- Holdings: ${JSON.stringify(portfolioContext.holdings || [])}

Use this context to provide more personalized advice.`;
    }

    return prompt;
  }

    // mock response (for testing or api unavailable)
  async getMockResponse(message: string): Promise<string> {
    const responses = {
      'portfolio performance': 'Based on your portfolio data, I can see you have a diversified mix of stocks and funds. Your current allocation shows a 60/40 split between equities and fixed income, which is a solid foundation. Would you like me to analyze specific performance metrics or suggest rebalancing opportunities?',
      'invest': 'Looking at your current holdings and market conditions, I recommend considering these opportunities:\n\n1. **Technology ETFs** - For growth potential\n2. **Dividend-paying stocks** - For income generation\n3. **International exposure** - For diversification\n\nWould you like me to provide specific recommendations based on your risk tolerance?',
      'risk': 'Your current portfolio shows moderate risk exposure. Here\'s my assessment:\n\n• **Equity allocation**: 60% (Moderate risk)\n• **Fixed income**: 40% (Lower risk)\n• **Geographic diversification**: Good\n• **Sector concentration**: Watch tech exposure\n\nConsider rebalancing if your risk tolerance has changed.',
      'market': 'Current market analysis:\n\n📈 **Bullish indicators**:\n• Strong earnings growth\n• Low unemployment\n• Fed policy support\n\n⚠️ **Risks to watch**:\n• Inflation concerns\n• Geopolitical tensions\n• Interest rate changes\n\nI recommend staying diversified and dollar-cost averaging.',
      'rebalancing': 'Based on your current portfolio, here are my rebalancing recommendations:\n\n1. **Reduce tech exposure** if >30% of portfolio\n2. **Increase international** to 20-25%\n3. **Add defensive stocks** for stability\n4. **Consider bonds** for income\n\nWould you like a detailed rebalancing plan?'
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