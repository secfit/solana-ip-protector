import React from 'react';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { ScoreDisplay } from './ScoreDisplay';
import { PaperSection } from '../types';
import { Shield, Clock, CheckCircle } from 'lucide-react';

interface SectionCardProps {
  section: PaperSection;
  isProcessing?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({ 
  section, 
  isProcessing = false 
}) => {
  const getSectionTitle = (type: string) => {
    switch (type) {
      case 'abstract': return 'Abstract';
      case 'introduction': return 'Introduction';
      case 'related_works': return 'Related Works';
      case 'proposed_model': return 'Proposed Model';
      case 'conclusion': return 'Conclusion';
      default: return type;
    }
  };

  const getStatusIcon = () => {
    if (isProcessing) return <Clock className="w-4 h-4 text-yellow-500" />;
    if (section.summary && section.uniquenessScore !== undefined) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return null;
  };

  return (
    <Card className="h-full">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">{getSectionTitle(section.type)}</h4>
            {getStatusIcon()}
          </div>
          {section.tokenAddress && (
            <Badge variant="success">
              <Shield className="w-3 h-3 mr-1" />
              Protected
            </Badge>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-700 line-clamp-3">
            {section.content.substring(0, 200)}...
          </p>
        </div>

        {section.summary && (
          <div className="space-y-2">
            <h5 className="font-medium text-gray-800">AI Summary</h5>
            <p className="text-sm text-gray-600">{section.summary}</p>
          </div>
        )}

        {section.uniquenessScore !== undefined && (
          <ScoreDisplay 
            score={section.uniquenessScore} 
            section="Uniqueness Score" 
            showIcon={false}
          />
        )}

        {section.nftAddress && (
          <div className="text-xs text-gray-500 font-mono">
            NFT: {section.nftAddress.slice(0, 8)}...{section.nftAddress.slice(-8)}
          </div>
        )}
      </div>
    </Card>
  );
};