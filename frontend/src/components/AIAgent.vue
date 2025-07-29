<template>
  <div class="ai-agent">
    <div class="ai-header">
      <div class="ai-title">
        <i class="ai-icon">🤖</i>
        <h2>AI Portfolio Assistant</h2>
      </div>
      <div class="ai-status" :class="{ online: isConnected }">
        <span class="status-dot"></span>
        {{ isConnected ? 'Connected' : 'Connecting...' }}
      </div>
    </div>

    <div class="chat-container">
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
            rows="3"
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
        
        <div class="quick-actions">
          <button 
            v-for="suggestion in quickSuggestions" 
            :key="suggestion"
            @click="sendQuickMessage(suggestion)"
            class="quick-action-btn"
            :disabled="isLoading"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>

    <div class="ai-sidebar">
      <div class="sidebar-section">
        <h3>Portfolio Context</h3>
        <div class="context-item">
          <span class="label">Total Assets:</span>
          <span class="value">${{ portfolioSummary?.totalValue || '0.00' }}</span>
        </div>
        <div class="context-item">
          <span class="label">Cash Balance:</span>
          <span class="value">${{ portfolioSummary?.cash || '0.00' }}</span>
        </div>
        <div class="context-item">
          <span class="label">Holdings:</span>
          <span class="value">{{ portfolioSummary?.holdingsCount || 0 }} items</span>
        </div>
      </div>

      <div class="sidebar-section">
        <h3>AI Capabilities</h3>
        <ul class="capabilities-list">
          <li>📊 Portfolio Analysis</li>
          <li>💡 Investment Advice</li>
          <li>📈 Market Insights</li>
          <li>⚖️ Risk Assessment</li>
          <li>🎯 Strategy Recommendations</li>
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

    const quickSuggestions = [
      'Analyze my portfolio performance',
      'What should I invest in?',
      'How is my risk exposure?',
      'Market trends this week',
      'Portfolio rebalancing advice'
    ]

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

    const sendQuickMessage = (suggestion) => {
      userInput.value = suggestion
      sendMessage()
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
        const response = await portfolioAPI.getPortfolio()
        portfolioSummary.value = response.data
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
      quickSuggestions,
      formatTime,
      formatMessage,
      sendMessage,
      sendQuickMessage
    }
  }
}
</script>

<style scoped>
.ai-agent {
  display: flex;
  height: calc(100vh - 120px);
  gap: 20px;
  padding: 20px;
}

.ai-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.ai-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-title h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.ai-icon {
  font-size: 1.8rem;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.chat-messages {
  flex: 1;
  padding: 80px 20px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  padding: 20px;
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

.quick-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-action-btn {
  padding: 8px 16px;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  background: white;
  color: #495057;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.quick-action-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.quick-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-sidebar {
  width: 280px;
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