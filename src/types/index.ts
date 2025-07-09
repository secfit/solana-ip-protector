// Core types for the application
export interface PaperSection {
  type: 'abstract' | 'introduction' | 'related_works' | 'proposed_model' | 'conclusion';
  content: string;
  summary?: string;
  uniquenessScore?: number;
  nftAddress?: string;
  metadataUri?: string;
  transactionSignature?: string;
  solscanUrl?: string;
}

export interface AnalysisResult {
  summary: string;
  uniquenessScore: number;
  timestamp: number;
}

export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  balance: number;
}

export interface IPProtectionData {
  sections: PaperSection[];
  authorWallet: string;
  createdAt: number;
  totalScore: number;
}

export interface SectionUpload {
  id: string;
  type: 'abstract' | 'introduction' | 'related_works' | 'proposed_model' | 'conclusion';
  title: string;
  content: string;
  isAnalyzed: boolean;
  isMinted: boolean;
  summary?: string;
  uniquenessScore?: number;
  nftAddress?: string;
  transactionSignature?: string;
  solscanUrl?: string;
}