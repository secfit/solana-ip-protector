import React from 'react';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { ScoreDisplay } from '../molecules/ScoreDisplay';
import { PaperSection } from '../types';
import { TrendingUp, Shield, Award } from 'lucide-react';

interface AnalysisResultsProps {
  sections: PaperSection[];
  totalScore: number;
  isProtected: boolean;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  sections,
  totalScore,
  isProtected
}) => {
  const processedSections = sections.filter(s => s.summary && s.uniquenessScore !== undefined);

  if (processedSections.length === 0) {
    return null;
  }

  return (
    <Card title="Analysis Results">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{totalScore}</p>
            <p className="text-sm text-blue-800">Overall Score</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex justify-center mb-2">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{processedSections.length}</p>
            <p className="text-sm text-green-800">Sections Protected</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="flex justify-center mb-2">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <Badge variant={isProtected ? 'success' : 'warning'}>
              {isProtected ? 'Protected' : 'Processing'}
            </Badge>
            <p className="text-sm text-purple-800 mt-1">IP Status</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Section Scores</h4>
          {processedSections.map((section, index) => (
            <ScoreDisplay
              key={index}
              score={section.uniquenessScore!}
              section={section.type.replace('_', ' ').toUpperCase()}
            />
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-800 mb-2">Protection Details</h5>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Each section has been analyzed for uniqueness and novelty</p>
            <p>• Summaries and scores are stored on Solana blockchain</p>
            <p>• PDA tokens created for each section provide proof of authorship</p>
            <p>• Immutable record prevents intellectual property theft</p>
          </div>
        </div>
      </div>
    </Card>
  );
};