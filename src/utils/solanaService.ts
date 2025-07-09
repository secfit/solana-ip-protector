import { Connection, PublicKey, Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import { PaperSection } from '../types';

export interface TransactionResult {
  signature: string;
  solscanUrl: string;
  success: boolean;
  error?: string;
}

export interface SolanaConfig {
  rpcUrl: string;
  network: 'devnet' | 'testnet' | 'mainnet-beta';
}

export class SolanaService {
  private connection: Connection;
  private config: SolanaConfig;
  private userKeypair: Keypair | null = null;

  constructor(config: SolanaConfig) {
    this.config = config;
    this.connection = new Connection(config.rpcUrl, 'confirmed');
  }

  // Method to set user keypair (IMPORTANT: Only for development/demo)
  setUserKeypair(privateKeyArray: number[]) {
    this.userKeypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    console.log('User Public Key:', this.userKeypair.publicKey.toString());
  }

  // Generate simple hash for content
  private generateContentHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Simulate NFT minting transaction
  async mintSectionNFT(
    section: PaperSection,
    authorPubkey: PublicKey
  ): Promise<TransactionResult> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate realistic transaction signature
      const signature = Keypair.generate().publicKey.toString();
      
      console.log(`Simulated NFT minting for ${section.type}:`, {
        section: section.type,
        contentHash: this.generateContentHash(section.content),
        uniquenessScore: section.uniquenessScore,
        summary: section.summary?.substring(0, 50) + '...'
      });

      return {
        signature,
        solscanUrl: this.getSolscanUrl(signature),
        success: true
      };

    } catch (error) {
      console.error('Failed to mint NFT:', error);
      return {
        signature: '',
        solscanUrl: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Real transaction implementation (for when you add your private key)
  async createRealTransaction(
    section: PaperSection,
    authorPubkey: PublicKey
  ): Promise<TransactionResult> {
    try {
      if (!this.userKeypair) {
        throw new Error('User keypair not set. Please configure your private key.');
      }

      // Create a simple transaction (transfer small amount to self as proof)
      const transaction = new Transaction();
      
      const instruction = SystemProgram.transfer({
        fromPubkey: this.userKeypair.publicKey,
        toPubkey: authorPubkey,
        lamports: 1000, // 0.000001 SOL
      });

      transaction.add(instruction);

      // Send transaction
      const signature = await this.connection.sendTransaction(
        transaction,
        [this.userKeypair],
        { skipPreflight: false }
      );

      // Wait for confirmation
      await this.connection.confirmTransaction(signature);

      return {
        signature,
        solscanUrl: this.getSolscanUrl(signature),
        success: true
      };

    } catch (error) {
      console.error('Failed to create real transaction:', error);
      return {
        signature: '',
        solscanUrl: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get Solscan URL for transaction
  private getSolscanUrl(signature: string): string {
    return `https://solscan.io/tx/${signature}?cluster=${this.config.network}`;
  }

  // Get account balance
  async getBalance(pubkey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(pubkey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  }

  // Check connection to Solana
  async checkConnection(): Promise<boolean> {
    try {
      const version = await this.connection.getVersion();
      console.log('Connected to Solana:', version);
      return true;
    } catch (error) {
      console.error('Failed to connect to Solana:', error);
      return false;
    }
  }
}

// Configuration for Solana devnet
export const SOLANA_CONFIG: SolanaConfig = {
  rpcUrl: 'https://api.devnet.solana.com',
  network: 'devnet'
};

/*
IMPORTANT: When and How to Add Your Solana Keys

1. **Current Phase (Demo Mode)**:
   - No real keys needed
   - Simulates all transactions
   - Perfect for learning and testing UI

2. **Real Devnet Testing**:
   Step 1: Generate a new keypair
   ```bash
   solana-keygen new --outfile ~/.config/solana/devnet.json
   ```
   
   Step 2: Get devnet SOL
   ```bash
   solana airdrop 2 --url devnet
   ```
   
   Step 3: Get your private key array
   ```bash
   cat ~/.config/solana/devnet.json
   ```
   
   Step 4: Add to your code (DEVELOPMENT ONLY)
   ```typescript
   const devnetPrivateKey = [1,2,3,4,5...]; // Your 64-byte array
   solanaService.setUserKeypair(devnetPrivateKey);
   ```

3. **Production**:
   - NEVER hardcode private keys in frontend
   - Use wallet adapters (Phantom, Solflare)
   - Private keys only in secure backend services

Cost for Real Transactions:
- Simple transaction: ~0.000005 SOL (~$0.00001)
- NFT creation: ~0.01 SOL (~$0.02)
- Very affordable for testing!
*/