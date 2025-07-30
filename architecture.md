# Portfolio Management System Architecture

## System Overall Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Vue.js Application] --> B[UI Components]
        B --> C[Dashboard.vue]
        B --> D[Portfolio.vue]
        B --> E[Stock.vue]
        B --> F[Fund.vue]
        B --> G[Transaction.vue]
        B --> H[Analytics.vue]
        B --> I[AIAgent.vue]
        B --> J[Cash.vue]
    end

    subgraph "API Layer"
        K[api.js] --> L[portfolioAPI]
        K --> M[predictionAPI]
        K --> N[stockAPI]
        K --> O[fundAPI]
        K --> P[aiAPI]
    end

    subgraph "Backend Layer"
        Q[Express Server] --> R[Route Layer]
        R --> S[portfolio.ts]
        R --> T[predict.ts]
        
        S --> U[Business Logic Layer]
        T --> U
        
        U --> V[Service Layer]
        V --> W[Database.ts]
        V --> X[FinancialDataService.ts]
        V --> Y[AIService.ts]
    end

    subgraph "Data Layer"
        Z[MySQL Database] --> AA[users table]
        Z --> BB[holdings table]
        Z --> CC[transactions table]
        Z --> DD[prediction_tasks table]
    end

    subgraph "External Services"
        EE[Yahoo Finance API] --> FF[Real-time Stock Prices]
        EE --> GG[Historical Data]
        GG --> HH[LSTM Model Training]
        
        II[AI Service] --> JJ[Smart Investment Advice]
        II --> KK[Prediction Analysis]
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
    participant User as User
    participant Frontend as Frontend (Vue.js)
    participant API as API Service (api.js)
    participant Backend as Backend (Express)
    participant DB as Database (MySQL)
    participant External as External Services

    %% Portfolio View Flow
    User->>Frontend: View Portfolio
    Frontend->>API: getPortfolio()
    API->>Backend: GET /api/portfolio
    Backend->>DB: Query User Holdings
    Backend->>External: Get Real-time Prices
    External-->>Backend: Return Price Data
    Backend-->>API: Return Portfolio Data
    API-->>Frontend: Update Interface

    %% Stock Trading Flow
    User->>Frontend: Buy Stock
    Frontend->>API: buyStock()
    API->>Backend: POST /api/portfolio/buy
    Backend->>External: Get Current Price
    External-->>Backend: Return Price
    Backend->>DB: Create Transaction Record
    Backend->>DB: Update Holdings
    Backend->>DB: Update Cash Balance
    Backend-->>API: Return Transaction Result
    API-->>Frontend: Show Success Message

    %% AI Prediction Flow
    User->>Frontend: Start Prediction
    Frontend->>API: startPrediction()
    API->>Backend: POST /api/predict
    Backend->>DB: Create Prediction Task
    Backend->>External: Get Historical Data
    External-->>Backend: Return Stock Data
    Backend->>Backend: Train LSTM Model
    Backend->>Backend: Execute Prediction
    Backend->>DB: Save Prediction Results
    Backend-->>API: Return Task ID
    API-->>Frontend: Show Training Status

    %% AI Chat Flow
    User->>Frontend: Send Message
    Frontend->>API: chat()
    API->>Backend: POST /api/portfolio/ai/chat
    Backend->>DB: Get Portfolio Context
    Backend->>External: Call AI Service
    External-->>Backend: Return AI Response
    Backend-->>API: Return Smart Advice
    API-->>Frontend: Display AI Reply
```

## Technology Stack Architecture

```mermaid
graph LR
    subgraph "Frontend Tech Stack"
        A1[Vue.js 3] --> A2[Vite]
        A2 --> A3[Axios]
        A3 --> A4[Vue Router]
    end

    subgraph "Backend Tech Stack"
        B1[Node.js] --> B2[Express.js]
        B2 --> B3[TypeScript]
        B3 --> B4[MySQL2]
        B4 --> B5[mysql2/promise]
    end

    subgraph "AI/ML Tech Stack"
        C1[TensorFlow.js] --> C2[LSTM Model]
        C2 --> C3[Yahoo Finance API]
        C3 --> C4[AI Service Integration]
    end

    subgraph "Database Tech Stack"
        D1[MySQL] --> D2[Connection Pool]
        D2 --> D3[Transaction Management]
        D3 --> D4[Data Persistence]
    end

    A1 --> B1
    B1 --> C1
    B1 --> D1
```

## Module Dependencies

```mermaid
graph TD
    subgraph "Frontend Modules"
        A[Dashboard] --> B[Portfolio]
        B --> C[Stock]
        B --> D[Fund]
        B --> E[Transaction]
        B --> F[Analytics]
        B --> G[AIAgent]
        B --> H[Cash]
    end

    subgraph "Backend Modules"
        I[Express App] --> J[Routes]
        J --> K[Portfolio Routes]
        J --> L[Predict Routes]
        
        K --> M[Database Model]
        K --> N[Financial Service]
        K --> O[AI Service]
        
        L --> P[LSTM Model]
        L --> Q[Prediction Service]
    end

    subgraph "Data Models"
        R[User Model] --> S[Holding Model]
        S --> T[Transaction Model]
        T --> U[Prediction Model]
    end

    A --> I
    I --> R
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        A[Frontend Dev Server<br/>localhost:5173] --> B[Backend API Server<br/>localhost:3000]
        B --> C[MySQL Database<br/>localhost:3306]
    end

    subgraph "Production Environment"
        D[Frontend Static Files<br/>Nginx/CDN] --> E[Backend API Server<br/>Node.js/PM2]
        E --> F[MySQL Database<br/>Cloud Database]
    end

    subgraph "External Services"
        G[Yahoo Finance API] --> E
        H[AI Service] --> E
    end

    A -.->|During Development| G
    A -.->|During Development| H
```

## Key Features

### 1. Real-time Data Flow
- **Stock Prices**: Real-time fetching via Yahoo Finance API
- **Portfolio Value**: Dynamic calculation based on current prices
- **Profit/Loss Analysis**: Real-time portfolio P&L updates

### 2. AI Prediction System
- **LSTM Model**: Training using TensorFlow.js
- **Historical Data**: 3-month data from Yahoo Finance
- **Prediction Results**: Stored in database for frontend queries

### 3. Smart Investment Advice
- **AI Chat**: Integrated AI service for investment advice
- **Portfolio Analysis**: Personalized recommendations based on user holdings

### 4. Data Consistency
- **Transaction Management**: MySQL transactions ensure data consistency
- **Connection Pooling**: Optimized database connection performance
- **Error Handling**: Comprehensive error handling mechanisms

## Performance Optimization

1. **Frontend Optimization**: Vue.js virtual DOM, component lazy loading
2. **Backend Optimization**: Connection pooling, caching mechanisms
3. **Database Optimization**: Index optimization, query optimization
4. **Network Optimization**: HTTP/2, compression transmission

## Security Considerations

1. **Input Validation**: Frontend and backend dual validation
2. **SQL Injection Protection**: Parameterized queries
3. **CORS Configuration**: Cross-origin request control
4. **Environment Variables**: Sensitive information configuration 
