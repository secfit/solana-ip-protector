#FLOWCHART.md
# Solana IP Protector - System Flowcharts

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "User Interface Layer"
        A[React Frontend] --> B[Section Upload Interface]
        A --> C[Analysis Results Display]
        A --> D[Transaction History]
    end
    
    subgraph "Processing Layer"
        E[Python Flask Backend] --> F[AI Analysis Service]
        E --> G[Content Validation]
        E --> H[Metadata Generation]
    end
    
    subgraph "External Services"
        I[OpenAI GPT-4o API] --> F
        J[Solana Devnet] --> K[NFT Minting Service]
        L[Solana Explorer] --> M[Transaction Verification]
    end
    
    B --> E
    F --> C
    K --> D
    H --> K
    K --> M
    
    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style I fill:#fff3e0
    style J fill:#e8f5e8
```

## 2. Information Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant AI as GPT-4o API
    participant S as Solana Network
    participant E as Explorer
    
    U->>F: Upload Section Content
    F->>F: Validate Input
    F->>B: POST /api/analyze-section
    B->>B: Create Temp File
    B->>AI: Analyze Content
    AI->>B: Return Score + Summary
    B->>F: Analysis Results
    F->>U: Display AI Analysis
    
    U->>F: Request NFT Minting
    F->>S: Create Data Account
    S->>S: Generate Transaction
    S->>F: Transaction Signature
    F->>E: Generate Explorer Link
    F->>U: Show Blockchain Proof
```

## 3. Data Processing Pipeline

```mermaid
flowchart TD
    A[Section Content Input] --> B{Content Validation}
    B -->|Valid| C[Content Hash Generation]
    B -->|Invalid| D[Error Message]
    
    C --> E[AI Analysis Request]
    E --> F[GPT-4o Processing]
    F --> G[Uniqueness Score 0-100]
    F --> H[AI-Generated Summary]
    
    G --> I[Metadata Creation]
    H --> I
    C --> I
    
    I --> J[Blockchain Transaction]
    J --> K[NFT Data Account]
    K --> L[Solana Explorer Link]
    L --> M[Immutable IP Proof]
    
    style A fill:#bbdefb
    style G fill:#c8e6c9
    style H fill:#c8e6c9
    style M fill:#ffcdd2
```

## 4. Security & Validation Flow

```mermaid
graph TB
    subgraph "Input Security"
        A[User Input] --> B[Content Sanitization]
        B --> C[Length Validation]
        C --> D[Type Checking]
    end
    
    subgraph "Processing Security"
        E[Temporary File Creation] --> F[Secure File Handling]
        F --> G[Process Isolation]
        G --> H[File Cleanup]
    end
    
    subgraph "Blockchain Security"
        I[Private Key Validation] --> J[Transaction Signing]
        J --> K[Network Verification]
        K --> L[Immutable Storage]
    end
    
    subgraph "Output Security"
        M[Result Validation] --> N[Error Sanitization]
        N --> O[Safe Response]
    end
    
    D --> E
    H --> I
    L --> M
    
    style A fill:#ffebee
    style E fill:#fff3e0
    style I fill:#e8f5e8
    style M fill:#f3e5f5
```

## 5. Component Interaction Diagram

```mermaid
graph TD
    subgraph "React Components"
        A[HomePage] --> B[SectionUpload]
        A --> C[WalletConnection]
        A --> D[TransactionHistory]
        B --> E[Button]
        B --> F[Card]
        C --> G[Badge]
    end
    
    subgraph "Service Layer"
        H[AIAnalysisService] --> I[Backend API]
        J[NFTService] --> K[Solana Web3]
        L[SolanaService] --> K
    end
    
    subgraph "External APIs"
        M[Flask Backend] --> N[OpenAI API]
        O[Solana RPC] --> P[Blockchain Network]
    end
    
    B --> H
    C --> J
    D --> L
    I --> M
    K --> O
    
    style A fill:#e3f2fd
    style H fill:#fff3e0
    style M fill:#f3e5f5
    style O fill:#e8f5e8
```
