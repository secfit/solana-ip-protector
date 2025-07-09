import React, { useState } from 'react';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { SectionCard } from '../molecules/SectionCard';
import { TransactionHistory, Transaction } from '../molecules/TransactionHistory';
import { PaperSection } from '../types';
import { Brain, Shield, Zap } from 'lucide-react';

interface PaperAnalysisProps {
  sections: PaperSection[];
  onAnalyze: (sections: PaperSection[]) => void;
  onProtect: (sections: PaperSection[]) => void;
  isAnalyzing: boolean;
  isProtecting: boolean;
  transactions: Transaction[];
}

export const PaperAnalysis: React.FC<PaperAnalysisProps> = ({
  sections,
  onAnalyze,
  onProtect,
  isAnalyzing,
  isProtecting,
  transactions
}) => {
  const hasAnalyzedSections = sections.some(s => s.summary && s.uniquenessScore !== undefined);
  const hasProtectedSections = sections.some(s => s.tokenAddress);

  return (
    <div className="space-y-6">
      <Card title="Extracted Sections">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              {sections.length} sections extracted from your paper
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => onAnalyze(sections)}
                disabled={isAnalyzing || hasAnalyzedSections}
                loading={isAnalyzing}
                variant="primary"
              >
                <Brain className="w-4 h-4" />
                {hasAnalyzedSections ? 'Analyzed' : 'Analyze with AI'}
              </Button>
              
              {hasAnalyzedSections && (
                <Button
                  onClick={() => onProtect(sections)}
                  disabled={isProtecting || hasProtectedSections}
                  loading={isProtecting}
                  variant="secondary"
                >
                  <Shield className="w-4 h-4" />
                  {hasProtectedSections ? 'Protected' : 'Protect on Blockchain'}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section, index) => (
              <SectionCard
                key={index}
                section={section}
                isProcessing={isAnalyzing || isProtecting}
              />
            ))}
          </div>
        </div>
      </Card>

      {hasAnalyzedSections && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800">AI Analysis Complete</h4>
              <p className="text-sm text-blue-600">
                Your paper has been analyzed. Ready for blockchain protection.
              </p>
            </div>
          </div>
        </Card>
      )}

      {transactions.length > 0 && (
        <TransactionHistory transactions={transactions} />
      )}
    </div>
  );
};