# Portfolio Management System Flowcharts

## 1. Stock Trading Flow

### Buy Stock Flow

```mermaid
flowchart TD
    A[User clicks Buy Stock] --> B[Select Stock Ticker]
    B --> C[Enter Quantity]
    C --> D[Select Price Type]
    D --> E{Use Market Price?}
    E -->|Yes| F[Get Real-time Price]
    E -->|No| G[Use User Input Price]
    F --> H[Validate User Cash Balance]
    G --> H
    H --> I{Sufficient Cash?}
    I -->|No| J[Display Insufficient Balance Error]
    I -->|Yes| K[Call Buy API]
    K --> L[Backend Validate Data]
    L --> M{Validation Passed?}
    M -->|No| N[Return Validation Error]
    M -->|Yes| O[Get Current Market Price]
    O --> P[Check Cash Balance]
    P --> Q{Sufficient Balance?}
    Q -->|No| R[Return Insufficient Balance]
    Q -->|Yes| S[Create Transaction Record]
    S --> T[Update Holdings]
    T --> U[Deduct Cash Balance]
    U --> V[Update User Net Worth]
    V --> W[Return Success Response]
    W --> X[Frontend Display Success Message]
    X --> Y[Refresh Portfolio Data]
    Y --> Z[Update Interface Display]
```

### Sell Stock Flow

```mermaid
flowchart TD
    A[User clicks Sell Stock] --> B[Select Stock Ticker]
    B --> C[Enter Quantity]
    C --> D[Select Price Type]
    D --> E{Use Market Price?}
    E -->|Yes| F[Get Real-time Price]
    E -->|No| G[Use User Input Price]
    F --> H[Validate Holdings Quantity]
    G --> H
    H --> I{Sufficient Holdings?}
    I -->|No| J[Display Insufficient Holdings Error]
    I -->|Yes| K[Call Sell API]
    K --> L[Backend Validate Data]
    L --> M{Validation Passed?}
    M -->|No| N[Return Validation Error]
    M -->|Yes| O[Get Current Market Price]
    O --> P[Check Holdings Quantity]
    P --> Q{Sufficient Holdings?}
    Q -->|No| R[Return Insufficient Holdings]
    Q -->|Yes| S[Create Transaction Record]
    S --> T[Update Holdings]
    T --> U[Increase Cash Balance]
    U --> V[Update User Net Worth]
    V --> W[Return Success Response]
    W --> X[Frontend Display Success Message]
    X --> Y[Refresh Portfolio Data]
    Y --> Z[Update Interface Display]
```

## 2. Fund Trading Flow

### Buy Fund Flow

```mermaid
flowchart TD
    A[User clicks Buy Fund] --> B[Select Fund Ticker]
    B --> C[Enter Units Quantity]
    C --> D[Select Price Type]
    D --> E{Use Market Price?}
    E -->|Yes| F[Get Real-time Fund Price]
    E -->|No| G[Use User Input Price]
    F --> H[Validate User Cash Balance]
    G --> H
    H --> I{Sufficient Cash?}
    I -->|No| J[Display Insufficient Balance Error]
    I -->|Yes| K[Call Buy Fund API]
    K --> L[Backend Validate Data]
    L --> M{Validation Passed?}
    M -->|No| N[Return Validation Error]
    M -->|Yes| O[Get Current Fund Price]
    O --> P[Check Cash Balance]
    P --> Q{Sufficient Balance?}
    Q -->|No| R[Return Insufficient Balance]
    Q -->|Yes| S[Create Fund Transaction Record]
    S --> T[Update Fund Holdings]
    T --> U[Deduct Cash Balance]
    U --> V[Update User Net Worth]
    V --> W[Return Success Response]
    W --> X[Frontend Display Success Message]
    X --> Y[Refresh Portfolio Data]
    Y --> Z[Update Interface Display]
```

### Sell Fund Flow

```mermaid
flowchart TD
    A[User clicks Sell Fund] --> B[Select Fund Ticker]
    B --> C[Enter Units Quantity]
    C --> D[Select Price Type]
    D --> E{Use Market Price?}
    E -->|Yes| F[Get Real-time Fund Price]
    E -->|No| G[Use User Input Price]
    F --> H[Validate Fund Holdings Quantity]
    G --> H
    H --> I{Sufficient Holdings?}
    I -->|No| J[Display Insufficient Holdings Error]
    I -->|Yes| K[Call Sell Fund API]
    K --> L[Backend Validate Data]
    L --> M{Validation Passed?}
    M -->|No| N[Return Validation Error]
    M -->|Yes| O[Get Current Fund Price]
    O --> P[Check Fund Holdings Quantity]
    P --> Q{Sufficient Holdings?}
    Q -->|No| R[Return Insufficient Holdings]
    Q -->|Yes| S[Create Fund Transaction Record]
    S --> T[Update Fund Holdings]
    T --> U[Increase Cash Balance]
    U --> V[Update User Net Worth]
    V --> W[Return Success Response]
    W --> X[Frontend Display Success Message]
    X --> Y[Refresh Portfolio Data]
    Y --> Z[Update Interface Display]
```

## 3. Cash Management Flow

### Deposit Flow

```mermaid
flowchart TD
    A[User clicks Deposit] --> B[Enter Deposit Amount]
    B --> C[Validate Amount Format]
    C --> D{Valid Amount?}
    D -->|No| E[Display Amount Format Error]
    D -->|Yes| F[Call Deposit API]
    F --> G[Backend Validate Data]
    G --> H{Validation Passed?}
    H -->|No| I[Return Validation Error]
    H -->|Yes| J[Update User Cash Balance]
    J --> K[Create Cash Transaction Record]
    K --> L[Update User Net Worth]
    L --> M[Return Success Response]
    M --> N[Frontend Display Success Message]
    N --> O[Refresh Cash Balance Display]
    O --> P[Update Portfolio Total Value]
```

### Withdraw Flow

```mermaid
flowchart TD
    A[User clicks Withdraw] --> B[Enter Withdraw Amount]
    B --> C[Validate Amount Format]
    C --> D{Valid Amount?}
    D -->|No| E[Display Amount Format Error]
    D -->|Yes| F[Call Withdraw API]
    F --> G[Backend Validate Data]
    G --> H{Validation Passed?}
    H -->|No| I[Return Validation Error]
    H -->|Yes| J[Check Cash Balance]
    J --> K{Sufficient Balance?}
    K -->|No| L[Return Insufficient Balance Error]
    K -->|Yes| M[Update User Cash Balance]
    M --> N[Create Cash Transaction Record]
    N --> O[Update User Net Worth]
    O --> P[Return Success Response]
    P --> Q[Frontend Display Success Message]
    Q --> R[Refresh Cash Balance Display]
    R --> S[Update Portfolio Total Value]
```

## 4. AI Prediction Flow

### Start Prediction Flow

```mermaid
flowchart TD
    A[User clicks Start Prediction] --> B[Display Prediction Status]
    B --> C[Call Prediction API]
    C --> D[Backend Create Prediction Task]
    D --> E[Return Task ID]
    E --> F[Frontend Display Training Status]
    F --> G[Start Background Prediction Process]
    G --> H[Get Stock List]
    H --> I[Iterate Each Stock]
    I --> J[Get Historical Data]
    J --> K[Data Preprocessing]
    K --> L[Train LSTM Model]
    L --> M[Execute Prediction]
    M --> N[Save Prediction Results]
    N --> O{More Stocks?}
    O -->|Yes| I
    O -->|No| P[Update Task Status to Complete]
    P --> Q[Frontend Poll Task Status]
    Q --> R{Task Completed?}
    R -->|No| Q
    R -->|Yes| S[Display Prediction Results]
    S --> T[Update Prediction Interface]
```

### View Prediction Results Flow

```mermaid
flowchart TD
    A[User views prediction results] --> B[Get prediction task list]
    B --> C[Select specific task]
    C --> D[Call get task API]
    D --> E[Backend query task data]
    E --> F{Task exists?}
    F -->|No| G[Display task not found]
    F -->|Yes| H[Return task details]
    H --> I[Parse prediction results]
    I --> J[Format display data]
    J --> K[Display prediction charts]
    K --> L[Display prediction table]
    L --> M[Display confidence metrics]
    M --> N[Provide export functionality]
```

## 5. AI Chat Flow

### Smart Investment Advice Flow

```mermaid
flowchart TD
    A[User inputs question] --> B[Get portfolio context]
    B --> C[Call AI chat API]
    C --> D[Backend get user data]
    D --> E[Build portfolio context]
    E --> F[Call AI service]
    F --> G[AI analyze portfolio]
    G --> H[Generate personalized advice]
    H --> I[Return AI response]
    I --> J[Frontend display response]
    J --> K[Format display]
    K --> L[Provide follow-up action suggestions]
    L --> M[Record conversation history]
```

## 6. Portfolio View Flow

### Portfolio Data Loading Flow

```mermaid
flowchart TD
    A[User visits portfolio page] --> B[Display loading status]
    B --> C[Call portfolio API]
    C --> D[Backend get user data]
    D --> E[Query user holdings]
    E --> F[Get real-time price data]
    F --> G[Calculate holdings value]
    G --> H[Calculate profit/loss]
    H --> I[Calculate asset allocation]
    I --> J[Return complete data]
    J --> K[Frontend render interface]
    K --> L[Display portfolio summary]
    L --> M[Display holdings list]
    M --> N[Display profit/loss charts]
    N --> O[Display asset allocation chart]
    O --> P[Provide data refresh functionality]
```

### Real-time Data Update Flow

```mermaid
flowchart TD
    A[Scheduled update trigger] --> B[Get holdings list]
    B --> C[Iterate each stock/fund]
    C --> D[Call price API]
    D --> E[Get latest price]
    E --> F[Calculate new value]
    F --> G[Calculate new profit/loss]
    G --> H{More holdings?}
    H -->|Yes| C
    H -->|No| I[Update total value]
    I --> J[Update profit/loss statistics]
    J --> K[Update interface display]
    K --> L[Save update history]
    L --> M[Trigger notifications]
```

## 7. Transaction History View Flow

### Transaction Record Query Flow

```mermaid
flowchart TD
    A[User views transaction history] --> B[Select time range]
    B --> C[Select asset type]
    C --> D[Call transaction history API]
    D --> E[Backend query database]
    E --> F[Filter by conditions]
    F --> G[Sort transaction records]
    G --> H[Pagination processing]
    H --> I[Return transaction data]
    I --> J[Frontend render table]
    J --> K[Display transaction details]
    K --> L[Provide filter functionality]
    L --> M[Provide export functionality]
    M --> N[Display statistics information]
```

## 8. Asset Allocation Analysis Flow

### Asset Allocation Calculation Flow

```mermaid
flowchart TD
    A[User views asset allocation] --> B[Get all holdings data]
    B --> C[Get real-time prices]
    C --> D[Calculate various asset values]
    D --> E[Calculate cash value]
    E --> F[Calculate stock value]
    F --> G[Calculate fund value]
    G --> H[Calculate total asset value]
    H --> I[Calculate asset allocation percentages]
    I --> J[Generate allocation charts]
    J --> K[Display allocation details]
    K --> L[Provide allocation recommendations]
    L --> M[Display historical allocation changes]
```

## 9. Market Data View Flow

### Real-time Market Data Flow

```mermaid
flowchart TD
    A[User views market data] --> B[Get popular stock list]
    B --> C[Call market data API]
    C --> D[Get real-time prices]
    D --> E[Get price change data]
    E --> F[Get volume data]
    F --> G[Format display data]
    G --> H[Display price charts]
    H --> I[Display price change colors]
    I --> J[Provide search functionality]
    J --> K[Provide sorting functionality]
    K --> L[Provide filter functionality]
    L --> M[Scheduled auto refresh]
```

## 10. Error Handling Flow

### General Error Handling Flow

```mermaid
flowchart TD
    A[Operation execution] --> B{Success?}
    B -->|Yes| C[Normal flow]
    B -->|No| D[Catch error]
    D --> E[Log error]
    E --> F[Analyze error type]
    F --> G{Network error?}
    G -->|Yes| H[Display network error]
    G -->|No| I{Validation error?}
    I -->|Yes| J[Display validation error]
    I -->|No| K{Permission error?}
    K -->|Yes| L[Display permission error]
    K -->|No| M{System error?}
    M -->|Yes| N[Display system error]
    M -->|No| O[Display general error]
    H --> P[Provide retry options]
    J --> P
    L --> P
    N --> P
    O --> P
    P --> Q[Record user operation]
    Q --> R[Provide help information]
```

## 11. Data Synchronization Flow

### Frontend-Backend Data Sync Flow

```mermaid
flowchart TD
    A[Frontend initiate request] --> B[API call]
    B --> C[Backend processing]
    C --> D[Database operation]
    D --> E[Return response]
    E --> F[Frontend update state]
    F --> G[Update interface display]
    G --> H[Trigger related updates]
    H --> I[Update cache]
    I --> J[Record operation log]
    J --> K[Notify other components]
    K --> L[Complete synchronization]
```

## 12. User Authentication Flow

### User Login Flow

```mermaid
flowchart TD
    A[User inputs login info] --> B[Validate input format]
    B --> C{Format correct?}
    C -->|No| D[Display format error]
    C -->|Yes| E[Call login API]
    E --> F[Backend validate user]
    F --> G{Validation successful?}
    G -->|No| H[Display login failure]
    G -->|Yes| I[Generate user session]
    I --> J[Return user information]
    J --> K[Frontend save user state]
    K --> L[Navigate to main page]
    L --> M[Load user data]
```

## 13. System Monitoring Flow

### Performance Monitoring Flow

```mermaid
flowchart TD
    A[System running] --> B[Monitor API response time]
    B --> C[Monitor database performance]
    C --> D[Monitor memory usage]
    D --> E[Monitor CPU usage]
    E --> F[Monitor network requests]
    F --> G[Analyze performance metrics]
    G --> H{Performance normal?}
    H -->|No| I[Trigger alert]
    H -->|Yes| J[Record performance log]
    I --> K[Send notification]
    K --> L[Record alert log]
    J --> M[Update monitoring dashboard]
    L --> M
    M --> N[Continue monitoring]
```

## 14. Data Backup Flow

### Database Backup Flow

```mermaid
flowchart TD
    A[Scheduled backup trigger] --> B[Check backup configuration]
    B --> C[Connect to database]
    C --> D[Create backup file]
    D --> E[Compress backup data]
    E --> F[Upload to backup storage]
    F --> G[Verify backup integrity]
    G --> H{Backup successful?}
    H -->|No| I[Record backup failure]
    H -->|Yes| J[Record backup success]
    I --> K[Send failure notification]
    J --> L[Clean old backups]
    K --> M[Retry backup]
    L --> N[Update backup log]
    M --> N
    N --> O[Complete backup process]
```

## 15. Deployment Flow

### System Deployment Flow

```mermaid
flowchart TD
    A[Code commit] --> B[Trigger CI/CD]
    B --> C[Run tests]
    C --> D{Tests passed?}
    D -->|No| E[Test failure notification]
    D -->|Yes| F[Build application]
    F --> G[Run security check]
    G --> H{Security check passed?}
    H -->|No| I[Security vulnerability notification]
    H -->|Yes| J[Deploy to test environment]
    J --> K[Run integration tests]
    K --> L{Integration tests passed?}
    L -->|No| M[Rollback deployment]
    L -->|Yes| N[Deploy to production]
    N --> O[Run health check]
    O --> P{Health check passed?}
    P -->|No| Q[Rollback production deployment]
    P -->|Yes| R[Deployment success notification]
    Q --> S[Record deployment failure]
    R --> T[Monitor system status]
    S --> T
    T --> U[Complete deployment process]
```

These flowcharts detail the complete execution flow of various functions in the system, including normal processes, exception handling, and error recovery mechanisms. Each flow considers user experience, system performance, and error handling aspects. 