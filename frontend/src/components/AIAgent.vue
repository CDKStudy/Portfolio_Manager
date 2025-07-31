<template>
  <div class="ai-agent">
    <div class="chat-container">
      <div class="chat-header">
        <div class="chat-title">
          <span class="chat-icon">🤖</span>
          <span>AI Portfolio Assistant</span>
        </div>
        <div class="ai-status" :class="{ online: isConnected }">
          <span class="status-dot"></span>
          {{ isConnected ? 'Connected' : 'Connecting...' }}
        </div>
      </div>
      <div class="chat-messages" ref="messagesContainer">
        <div 
          v-for="(message, index) in messages" 
          :key="index" 
          class="message"
          :class="message.type"
        >
          <div class="message-avatar">
            <i v-if="message.type === 'user'" class="avatar-icon">👤</i>
            <i v-else class="avatar-icon">🤖</i>
          </div>
          <div class="message-content">
            <div class="message-text" v-html="formatMessage(message.content)"></div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
        
        <div v-if="isLoading" class="message ai">
          <div class="message-avatar">
            <i class="avatar-icon">🤖</i>
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input-container">
        <div class="input-wrapper">
          <textarea
            v-model="userInput"
            @keydown.enter.prevent="sendMessage"
            placeholder="Ask me about your portfolio, investment strategies, or market analysis..."
            class="chat-input"
            rows="2"
            :disabled="isLoading"
          ></textarea>
          <button 
            @click="sendMessage" 
            class="send-button"
            :disabled="!userInput.trim() || isLoading"
          >
            <i class="send-icon">📤</i>
          </button>
        </div>
        

      </div>
    </div>

    <div class="ai-sidebar">
      <div class="sidebar-section">
        <h3>Portfolio Context</h3>
        <div class="context-item">
          <span class="label">Total Assets:</span>
          <span class="value">${{ formatCurrency(portfolioSummary?.netWorth || 0) }}</span>
        </div>
        <div class="context-item">
          <span class="label">Cash Balance:</span>
          <span class="value">${{ formatCurrency(portfolioSummary?.cash) }}</span>
        </div>
        <div class="context-item">
          <span class="label">Stocks:</span>
          <span class="value">${{ formatCurrency(portfolioSummary?.stockValue || 0) }}</span>
        </div>
        <div class="context-item">
          <span class="label">Funds:</span>
          <span class="value">${{ formatCurrency(portfolioSummary?.fundValue || 0) }}</span>
        </div>
        <div class="context-item">
          <span class="label">Holdings:</span>
          <span class="value">{{ portfolioSummary?.totalItems || 0 }} items</span>
        </div>
      </div>

      <div class="sidebar-section">
        <h3>AI Capabilities</h3>
        <ul class="capabilities-list">
          <li>
            <svg class="capability-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Portfolio Analysis
          </li>
          <li>
            <svg class="capability-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            Investment Advice
          </li>
          <li>
            <svg class="capability-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Market Insights
          </li>
          <li>
            <svg class="capability-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Risk Assessment
          </li>
          <li>
            <svg class="capability-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            Strategy Recommendations
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, computed } from 'vue'
import { portfolioAPI, aiAPI } from '../services/api.js'

export default {
  name: 'AIAgent',
  setup() {
    const messages = ref([])
    const userInput = ref('')
    const isLoading = ref(false)
    const isConnected = ref(true)
    const messagesContainer = ref(null)
    const portfolioSummary = ref(null)



    const formatCurrency = (value) => {
      if (value === null || value === undefined) return '0.00'
      return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString()
    }

    const formatMessage = (content) => {
      // Convert markdown-like formatting to HTML
      return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')
    }

    const scrollToBottom = async () => {
      await nextTick()
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    const addMessage = (content, type = 'user') => {
      messages.value.push({
        content,
        type,
        timestamp: new Date()
      })
      scrollToBottom()
    }



    const callDouBaoAPI = async (message) => {
      try {
        const response = await aiAPI.chat(message, portfolioSummary.value)
        return response.data.response
      } catch (error) {
        console.error('AI API Error:', error)
        // 模拟AI响应
        return generateMockResponse(message)
      }
    }

    const generateMockResponse = (message) => {
      const responses = {
        'portfolio performance': 'Based on your portfolio data, I can see you have a diversified mix of stocks and funds. Your current allocation shows a 60/40 split between equities and fixed income, which is a solid foundation. Would you like me to analyze specific performance metrics or suggest rebalancing opportunities?',
        'invest': 'Looking at your current holdings and market conditions, I recommend considering these opportunities:\n\n1. **Technology ETFs** - For growth potential\n2. **Dividend-paying stocks** - For income generation\n3. **International exposure** - For diversification\n\nWould you like me to provide specific recommendations based on your risk tolerance?',
        'risk': 'Your current portfolio shows moderate risk exposure. Here\'s my assessment:\n\n• **Equity allocation**: 60% (Moderate risk)\n• **Fixed income**: 40% (Lower risk)\n• **Geographic diversification**: Good\n• **Sector concentration**: Watch tech exposure\n\nConsider rebalancing if your risk tolerance has changed.',
        'market': 'Current market analysis:\n\n📈 **Bullish indicators**:\n• Strong earnings growth\n• Low unemployment\n• Fed policy support\n\n⚠️ **Risks to watch**:\n• Inflation concerns\n• Geopolitical tensions\n• Interest rate changes\n\nI recommend staying diversified and dollar-cost averaging.',
        'rebalancing': 'Based on your current portfolio, here are my rebalancing recommendations:\n\n1. **Reduce tech exposure** if >30% of portfolio\n2. **Increase international** to 20-25%\n3. **Add defensive stocks** for stability\n4. **Consider bonds** for income\n\nWould you like a detailed rebalancing plan?'
      }

      const lowerMessage = message.toLowerCase()
      for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
          return response
        }
      }

      return 'I\'m here to help with your portfolio analysis and investment decisions. I can provide insights on:\n\n• Portfolio performance analysis\n• Investment recommendations\n• Risk assessment\n• Market trends\n• Rebalancing strategies\n\nWhat specific aspect would you like to discuss?'
    }

    const sendMessage = async () => {
      if (!userInput.value.trim() || isLoading.value) return

      const message = userInput.value.trim()
      addMessage(message, 'user')
      userInput.value = ''
      isLoading.value = true

      try {
        const response = await callDouBaoAPI(message)
        addMessage(response, 'ai')
      } catch (error) {
        addMessage('Sorry, I encountered an error. Please try again.', 'ai')
      } finally {
        isLoading.value = false
      }
    }

    const loadPortfolioSummary = async () => {
      try {
        // Get user info for cash balance
        const userResponse = await portfolioAPI.getUser()
        const userInfo = userResponse.data
        
        // Get holdings with real-time prices
        const holdingsResponse = await portfolioAPI.getHoldings()
        const holdings = holdingsResponse.data.holdings || []
        
        // Calculate total value from real-time prices
        const totalValue = holdings.reduce((sum, holding) => 
          sum + (holding.totalValue || (holding.quantity * (holding.currentPrice || holding.buyPrice))), 0)
        
        // Calculate totals by type
        const stockHoldings = holdings.filter(h => h.type === 'stock')
        const fundHoldings = holdings.filter(h => h.type === 'fund')
        
        const stockValue = stockHoldings.reduce((sum, h) => 
          sum + (h.totalValue || (h.quantity * (h.currentPrice || h.buyPrice))), 0)
        const fundValue = fundHoldings.reduce((sum, h) => 
          sum + (h.totalValue || (h.quantity * (h.currentPrice || h.buyPrice))), 0)
        
        portfolioSummary.value = {
          totalValue: totalValue,
          cash: userInfo.cash,
          totalItems: holdings.length,
          stockValue: stockValue,
          fundValue: fundValue,
          netWorth: totalValue + userInfo.cash
        }
      } catch (error) {
        console.error('Failed to load portfolio summary:', error)
      }
    }

    onMounted(async () => {
      await loadPortfolioSummary()
      addMessage('Hello! I\'m your AI Portfolio Assistant. I can help you analyze your portfolio, provide investment advice, and answer questions about market trends. How can I assist you today?', 'ai')
    })

    return {
      messages,
      userInput,
      isLoading,
      isConnected,
      messagesContainer,
      portfolioSummary,
      formatCurrency,
      formatTime,
      formatMessage,
      sendMessage
    }
  }
}
</script>

<style scoped>
.ai-agent {
  display: flex;
  height: calc(100vh - 120px);
  gap: 24px;
  padding: 24px;
  width: 100%;
  background: #f1f5f9;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: 600;
}

.chat-icon {
  font-size: 1.5rem;
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff4757;
  animation: pulse 2s infinite;
}

.status-dot.online {
  background: #2ed573;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.chat-container {
  flex: 4;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  height: calc(100vh - 140px);
}

.chat-messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f8fafc;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.ai {
  align-self: flex-start;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.message.ai .message-avatar {
  background: linear-gradient(135deg, #2ed573 0%, #1e90ff 100%);
}

.avatar-icon {
  font-size: 1.2rem;
}

.message-content {
  flex: 1;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message.ai .message-content {
  background: white;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-text {
  line-height: 1.5;
  margin-bottom: 4px;
}

.message-text :deep(code) {
  background: #f1f3f4;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.message-time {
  font-size: 0.75rem;
  color: #6c757d;
  text-align: right;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6c757d;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.chat-input-container {
  padding: 16px 20px;
  border-top: 1px solid #e9ecef;
  background: white;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 24px;
  resize: none;
  font-family: inherit;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
  min-height: 40px;
  max-height: 100px;
}

.chat-input:focus {
  outline: none;
  border-color: #667eea;
}

.chat-input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.send-button {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-icon {
  font-size: 1.2rem;
}



.ai-sidebar {
  width: 260px;
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-section h3 {
  margin: 0 0 16px 0;
  color: #495057;
  font-size: 1.1rem;
  font-weight: 600;
}

.context-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
}

.context-item:last-child {
  border-bottom: none;
}

.context-item .label {
  color: #6c757d;
  font-size: 0.9rem;
}

.context-item .value {
  color: #495057;
  font-weight: 600;
  font-size: 0.9rem;
}

.capabilities-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.capabilities-list li {
  padding: 8px 0;
  color: #495057;
  font-size: 0.9rem;
  border-bottom: 1px solid #f1f3f4;
}

.capabilities-list li:last-child {
  border-bottom: none;
}

.capabilities-list li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.capability-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .ai-agent {
    flex-direction: column;
    height: auto;
  }
  
  .ai-sidebar {
    width: 100%;
    order: -1;
  }
  
  .message {
    max-width: 90%;
  }
}
</style> 