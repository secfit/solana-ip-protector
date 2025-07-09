import React, { useState, useEffect } from 'react';
import { WalletConnection } from '../molecules/WalletConnection';
import { SectionUpload } from '../molecules/SectionUpload';
import { TransactionHistory, Transaction } from '../molecules/TransactionHistory';
import { AIAnalysisService } from '../utils/aiAnalysis';
import { NFTService } from '../utils/nftService';
import { SectionUpload as SectionUploadType } from '../types';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Shield, BookOpen, Zap, AlertCircle, Award, TrendingUp, Brain, CheckCircle } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  // Initialize sections
  const [sections, setSections] = useState<SectionUploadType[]>([
    { id: 'abstract', type: 'abstract', title: 'Abstract', content: '', isAnalyzed: false, isMinted: false },
    { id: 'introduction', type: 'introduction', title: 'Introduction', content: '', isAnalyzed: false, isMinted: false },
    { id: 'related_works', type: 'related_works', title: 'Related Works', content: '', isAnalyzed: false, isMinted: false },
    { id: 'proposed_model', type: 'proposed_model', title: 'Proposed Model', content: '', isAnalyzed: false, isMinted: false },
    { id: 'conclusion', type: 'conclusion', title: 'Conclusion', content: '', isAnalyzed: false, isMinted: false },
  ]);

  // Initialize services
  // pubkey  EHNSDEX9dUVoXDTNn8dFAeCiUnY19qV1jZNUZjE6hHwz 
  const aiService = new AIAnalysisService();
  const nftService = new NFTService();

	const walletPrivateKey = import.meta.env.VITE_SOLANA_PRIVATE_KEY;
	if (walletPrivateKey) {
	  try {
		const keyArray = JSON.parse(walletPrivateKey);
		if (!Array.isArray(keyArray)) {
		  throw new Error('Wallet key is not a valid array');
		}
		nftService.setUserKeypair(keyArray);
		console.log('[Debug] Wallet key loaded successfully');
	  } catch (err) {
		console.error('[Error] Failed to load wallet key:', err);
	  }
	} else {
	  console.warn('[Debug] No wallet private key found in environment');
	}




  // Check backend status on component mount
  useEffect(() => {
    checkBackendStatus();
    checkSolanaConnection();
  }, []);

  const checkBackendStatus = async () => {
    setBackendStatus('checking');
    const isAvailable = await aiService.checkBackendHealth();
    setBackendStatus(isAvailable ? 'available' : 'unavailable');
  };

  const checkSolanaConnection = async () => {
    const connected = await nftService.checkConnection();
    console.log('[Debug] Solana connected:', connected);
    if (connected) {
      const userBalance = await nftService.getBalance();
      setBalance(userBalance);
      console.log('[Debug] Wallet Balance:', userBalance);
    }
  };

  const handleContentUpload = (sectionId: string, content: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, content, isAnalyzed: false, isMinted: false }
        : section
    ));
  };

  const handleAnalyze = async (sectionId: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const section = sections.find(s => s.id === sectionId);
      if (!section) throw new Error('Section not found');

      console.log(`Starting AI analysis for ${section.title}...`);

      // Call AI analysis for single section
      const result = await aiService.analyzeSingleSection(section.type, section.content);

      // Update section with analysis results
      setSections(prev => prev.map(s => 
        s.id === sectionId 
          ? { 
              ...s, 
              summary: result.summary, 
              uniquenessScore: result.uniquenessScore,
              isAnalyzed: true 
            }
          : s
      ));

      console.log(`AI analysis completed for ${section.title}:`, {
        score: result.uniquenessScore,
        summaryLength: result.summary.length
      });

    } catch (error) {
      console.error('AI Analysis failed:', error);
      setError(`AI analysis failed for ${sectionId}. ${error instanceof Error ? error.message : 'Please try again.'}`);
    }

    setIsAnalyzing(false);
  };

  const handleMintNFT = async (sectionId: string) => {
    setIsMinting(true);
    setError(null);

    try {
      const section = sections.find(s => s.id === sectionId);
      if (!section || !section.isAnalyzed) {
        throw new Error('Section must be analyzed before minting');
      }

      console.log(`Starting NFT minting for ${section.title}...`);

      // Mint NFT for the section
      const result = await nftService.mintSectionNFT(section);

      if (result.success) {
        // Update section with NFT information
        setSections(prev => prev.map(s => 
          s.id === sectionId 
            ? { 
                ...s, 
                nftAddress: result.nftAddress,
                transactionSignature: result.transactionSignature,
                solscanUrl: result.explorerUrl,
                isMinted: true 
              }
            : s
        ));

        // Add transaction to history
        const transaction: Transaction = {
          id: `nft_${sectionId}_${Date.now()}`,
          type: 'section_token',
          signature: result.transactionSignature!,
          explorerUrl: result.explorerUrl!,
          status: 'confirmed',
          timestamp: Date.now(),
          sectionType: section.title,
          amount: 0.002,
		  nftAddress: result.nftAddress
        };
        setTransactions(prev => [...prev, transaction]);

        // Update balance
        const newBalance = await nftService.getBalance();
        setBalance(newBalance);

        console.log(`NFT minted successfully for ${section.title}:`, {
          nftAddress: result.nftAddress,
          explorerUrl: result.explorerUrl
        });

      } else {
        throw new Error(result.error || 'NFT minting failed');
      }

    } catch (error) {
      console.error('NFT minting failed:', error);
      setError(`NFT minting failed for ${sectionId}. ${error instanceof Error ? error.message : 'Please try again.'}`);
    }

    setIsMinting(false);
  };

  // Calculate statistics
  const totalSections = sections.length;
  const analyzedSections = sections.filter(s => s.isAnalyzed).length;
  const mintedSections = sections.filter(s => s.isMinted).length;
  const averageScore = sections
    .filter(s => s.uniquenessScore !== undefined)
    .reduce((sum, s) => sum + (s.uniquenessScore || 0), 0) / analyzedSections || 0;

  // Check if we have a connected wallet (simulated or real)
  //const walletConnected = nftService.getUserPublicKey() !== null || true; // Always show as connected for demo
  //const publicKey = nftService.getUserPublicKey() || 'Demo Mode';
  
  const walletConnected = nftService.getUserPublicKey() !== null;
  const publicKey = nftService.getUserPublicKey() || 'Demo Mode';
  console.log('[Debug] Wallet Public Key:', publicKey);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="header">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper bg-blue-100">
                <Shield className="text-blue-600" style={{ width: '2rem', height: '2rem' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Solana IP Protector</h1>
                <p className="text-gray-600">Real AI Analysis + Blockchain NFT Protection</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="status-indicator"></div>
                Solana Devnet
              </div>
              <Badge variant={backendStatus === 'available' ? 'success' : 'warning'}>
                {backendStatus === 'checking' ? 'Checking...' : 
                 backendStatus === 'available' ? 'AI Backend Ready' : 'AI Fallback Mode'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Backend Status */}
          {backendStatus === 'unavailable' && (
            <Card className="border-yellow-200 bg-yellow-50">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-yellow-600" style={{ width: '1.25rem', height: '1.25rem' }} />
                <div>
                  <h4 className="font-semibold text-yellow-800">Python Backend Not Available</h4>
                  <p className="text-sm text-yellow-700">
                    Using fallback AI analysis. For real GPT-4o analysis, start the Python backend: 
                    <code className="bg-yellow-100 px-1 rounded font-mono ml-1">python backend.py</code>
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* How it works */}
          <Card title="Real AI Analysis + Blockchain Protection">
            <div className="grid md-grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="icon-wrapper bg-blue-100">
                    <BookOpen className="text-blue-600" style={{ width: '1.5rem', height: '1.5rem' }} />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Upload Sections</h3>
                <p className="text-sm text-gray-600">
                  Upload each research section individually for focused analysis
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="icon-wrapper bg-green-100">
                    <Brain className="text-green-600" style={{ width: '1.5rem', height: '1.5rem' }} />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Real AI Analysis</h3>
                <p className="text-sm text-gray-600">
                  Python backend calls GPT-4o for real uniqueness scoring and summaries
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="icon-wrapper bg-purple-50">
                    <Shield className="text-purple-600" style={{ width: '1.5rem', height: '1.5rem' }} />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Real NFT Minting</h3>
                <p className="text-sm text-gray-600">
                  Creates actual data accounts on Solana devnet with metadata
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="icon-wrapper bg-orange-50">
                    <CheckCircle className="text-orange-600" style={{ width: '1.5rem', height: '1.5rem' }} />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">4. Explorer Proof</h3>
                <p className="text-sm text-gray-600">
                  Verifiable on Solana Explorer with transaction signatures
                </p>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          {analyzedSections > 0 && (
            <Card title="Project Statistics">
              <div className="grid md-grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <TrendingUp className="text-blue-600" style={{ width: '2rem', height: '2rem' }} />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{Math.round(averageScore)}</p>
                  <p className="text-sm text-blue-800">Average Score</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <Brain className="text-green-600" style={{ width: '2rem', height: '2rem' }} />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{analyzedSections}/{totalSections}</p>
                  <p className="text-sm text-green-800">AI Analyzed</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <Shield className="text-purple-600" style={{ width: '2rem', height: '2rem' }} />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{mintedSections}/{totalSections}</p>
                  <p className="text-sm text-purple-800">Minted as NFTs</p>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <Award className="text-orange-600" style={{ width: '2rem', height: '2rem' }} />
                  </div>
                  <Badge variant={mintedSections === totalSections ? 'success' : 'warning'}>
                    {mintedSections === totalSections ? 'Complete' : 'In Progress'}
                  </Badge>
                  <p className="text-sm text-orange-800 mt-2">Protection Status</p>
                </div>
              </div>
            </Card>
          )}

          {/* Wallet Connection Status */}
          <WalletConnection
            connected={walletConnected}
            publicKey={publicKey}
            balance={balance}
          />

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-600" style={{ width: '1.25rem', height: '1.25rem' }} />
                <div>
                  <h4 className="font-semibold text-red-800">Error</h4>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Section Uploads */}
          <Card title="Upload and Protect Your Research Sections">
            <div className="grid lg-grid-cols-3 gap-6">
              {sections.map((section) => (
                <SectionUpload
                  key={section.id}
                  section={section}
                  onContentUpload={handleContentUpload}
                  onAnalyze={handleAnalyze}
                  onMintNFT={handleMintNFT}
                  isAnalyzing={isAnalyzing}
                  isMinting={isMinting}
                />
              ))}
            </div>
          </Card>

          {/* Transaction History */}
          {transactions.length > 0 && (
            <TransactionHistory transactions={transactions} />
          )}


        </div>
      </main>
    </div>
  );
};
