# 投资组合管理系统架构图

## 系统整体架构

```mermaid
graph TB
    subgraph "前端层 (Frontend)"
        A[Vue.js 应用] --> B[用户界面组件]
        B --> C[Dashboard.vue]
        B --> D[Portfolio.vue]
        B --> E[Stock.vue]
        B --> F[Fund.vue]
        B --> G[Transaction.vue]
        B --> H[Analytics.vue]
        B --> I[AIAgent.vue]
        B --> J[Cash.vue]
    end

    subgraph "API层 (API Layer)"
        K[api.js] --> L[portfolioAPI]
        K --> M[predictionAPI]
        K --> N[stockAPI]
        K --> O[fundAPI]
        K --> P[aiAPI]
    end

    subgraph "后端层 (Backend)"
        Q[Express 服务器] --> R[路由层]
        R --> S[portfolio.ts]
        R --> T[predict.ts]
        
        S --> U[业务逻辑层]
        T --> U
        
        U --> V[服务层]
        V --> W[Database.ts]
        V --> X[FinancialDataService.ts]
        V --> Y[AIService.ts]
    end

    subgraph "数据层 (Data Layer)"
        Z[MySQL 数据库] --> AA[users 表]
        Z --> BB[holdings 表]
        Z --> CC[transactions 表]
        Z --> DD[prediction_tasks 表]
    end

    subgraph "外部服务 (External Services)"
        EE[Yahoo Finance API] --> FF[实时股票价格]
        EE --> GG[历史数据]
        GG --> HH[LSTM 模型训练]
        
        II[AI 服务] --> JJ[智能投资建议]
        II --> KK[预测分析]
    end

    A --> K
    K --> Q
    U --> Z
    V --> EE
    V --> II
```

## 详细数据流图

```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as 前端 (Vue.js)
    participant API as API服务 (api.js)
    participant Backend as 后端 (Express)
    participant DB as 数据库 (MySQL)
    participant External as 外部服务

    %% 投资组合查看流程
    User->>Frontend: 查看投资组合
    Frontend->>API: getPortfolio()
    API->>Backend: GET /api/portfolio
    Backend->>DB: 查询用户持仓
    Backend->>External: 获取实时价格
    External-->>Backend: 返回价格数据
    Backend-->>API: 返回组合数据
    API-->>Frontend: 更新界面

    %% 股票交易流程
    User->>Frontend: 买入股票
    Frontend->>API: buyStock()
    API->>Backend: POST /api/portfolio/buy
    Backend->>External: 获取当前价格
    External-->>Backend: 返回价格
    Backend->>DB: 创建交易记录
    Backend->>DB: 更新持仓
    Backend->>DB: 更新现金余额
    Backend-->>API: 返回交易结果
    API-->>Frontend: 显示交易成功

    %% AI预测流程
    User->>Frontend: 启动预测
    Frontend->>API: startPrediction()
    API->>Backend: POST /api/predict
    Backend->>DB: 创建预测任务
    Backend->>External: 获取历史数据
    External-->>Backend: 返回股票数据
    Backend->>Backend: 训练LSTM模型
    Backend->>Backend: 执行预测
    Backend->>DB: 保存预测结果
    Backend-->>API: 返回任务ID
    API-->>Frontend: 显示训练状态

    %% AI聊天流程
    User->>Frontend: 发送消息
    Frontend->>API: chat()
    API->>Backend: POST /api/portfolio/ai/chat
    Backend->>DB: 获取投资组合上下文
    Backend->>External: 调用AI服务
    External-->>Backend: 返回AI回复
    Backend-->>API: 返回智能建议
    API-->>Frontend: 显示AI回复
```

## 技术栈架构

```mermaid
graph LR
    subgraph "前端技术栈"
        A1[Vue.js 3] --> A2[Vite]
        A2 --> A3[Axios]
        A3 --> A4[Vue Router]
    end

    subgraph "后端技术栈"
        B1[Node.js] --> B2[Express.js]
        B2 --> B3[TypeScript]
        B3 --> B4[MySQL2]
        B4 --> B5[mysql2/promise]
    end

    subgraph "AI/ML技术栈"
        C1[TensorFlow.js] --> C2[LSTM模型]
        C2 --> C3[Yahoo Finance API]
        C3 --> C4[AI服务集成]
    end

    subgraph "数据库技术栈"
        D1[MySQL] --> D2[连接池]
        D2 --> D3[事务管理]
        D3 --> D4[数据持久化]
    end

    A1 --> B1
    B1 --> C1
    B1 --> D1
```

## 模块依赖关系

```mermaid
graph TD
    subgraph "前端模块"
        A[Dashboard] --> B[Portfolio]
        B --> C[Stock]
        B --> D[Fund]
        B --> E[Transaction]
        B --> F[Analytics]
        B --> G[AIAgent]
        B --> H[Cash]
    end

    subgraph "后端模块"
        I[Express App] --> J[Routes]
        J --> K[Portfolio Routes]
        J --> L[Predict Routes]
        
        K --> M[Database Model]
        K --> N[Financial Service]
        K --> O[AI Service]
        
        L --> P[LSTM Model]
        L --> Q[Prediction Service]
    end

    subgraph "数据模型"
        R[User Model] --> S[Holding Model]
        S --> T[Transaction Model]
        T --> U[Prediction Model]
    end

    A --> I
    I --> R
```

## 部署架构

```mermaid
graph TB
    subgraph "开发环境"
        A[前端开发服务器<br/>localhost:5173] --> B[后端API服务器<br/>localhost:3000]
        B --> C[MySQL数据库<br/>localhost:3306]
    end

    subgraph "生产环境"
        D[前端静态文件<br/>Nginx/CDN] --> E[后端API服务器<br/>Node.js/PM2]
        E --> F[MySQL数据库<br/>云数据库]
    end

    subgraph "外部服务"
        G[Yahoo Finance API] --> E
        H[AI服务] --> E
    end

    A -.->|开发时| G
    A -.->|开发时| H
```

## 关键特性说明

### 1. 实时数据流
- **股票价格**: 通过Yahoo Finance API实时获取
- **持仓价值**: 动态计算基于当前价格
- **盈亏分析**: 实时更新投资组合盈亏

### 2. AI预测系统
- **LSTM模型**: 使用TensorFlow.js训练
- **历史数据**: 从Yahoo Finance获取3个月数据
- **预测结果**: 存储到数据库供前端查询

### 3. 智能投资建议
- **AI聊天**: 集成AI服务提供投资建议
- **投资组合分析**: 基于用户持仓提供个性化建议

### 4. 数据一致性
- **事务管理**: MySQL事务确保数据一致性
- **连接池**: 优化数据库连接性能
- **错误处理**: 完善的错误处理机制

## 性能优化

1. **前端优化**: Vue.js虚拟DOM，组件懒加载
2. **后端优化**: 连接池，缓存机制
3. **数据库优化**: 索引优化，查询优化
4. **网络优化**: HTTP/2，压缩传输

## 安全考虑

1. **输入验证**: 前后端双重验证
2. **SQL注入防护**: 参数化查询
3. **CORS配置**: 跨域请求控制
4. **环境变量**: 敏感信息配置化 
