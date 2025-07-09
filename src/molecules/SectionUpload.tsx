import React, { useState } from 'react';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Upload, FileText, Brain, Shield, ExternalLink, CheckCircle } from 'lucide-react';
import { SectionUpload as SectionUploadType } from '../types';

interface SectionUploadProps {
  section: SectionUploadType;
  onContentUpload: (sectionId: string, content: string) => void;
  onAnalyze: (sectionId: string) => void;
  onMintNFT: (sectionId: string) => void;
  isAnalyzing: boolean;
  isMinting: boolean;
}

export const SectionUpload: React.FC<SectionUploadProps> = ({
  section,
  onContentUpload,
  onAnalyze,
  onMintNFT,
  isAnalyzing,
  isMinting
}) => {
  const [textContent, setTextContent] = useState(section.content);
  const [isEditing, setIsEditing] = useState(!section.content);

  const handleSaveContent = () => {
    if (textContent.trim()) {
      onContentUpload(section.id, textContent.trim());
      setIsEditing(false);
    }
  };

  const getStatusBadge = () => {
    if (section.isMinted) {
      return <Badge variant="success"><Shield style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />NFT Minted</Badge>;
    }
    if (section.isAnalyzed) {
      return <Badge variant="info"><Brain style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />Analyzed</Badge>;
    }
    if (section.content) {
      return <Badge variant="warning"><FileText style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />Ready</Badge>;
    }
    return <Badge variant="error">Empty</Badge>;
  };

  return (
    <Card className="h-full">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
          {getStatusBadge()}
        </div>

        {/* Content Input/Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder={`Enter your ${section.title.toLowerCase()} content here...`}
                className="form-textarea"
                style={{ height: '8rem' }}
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveContent} disabled={!textContent.trim()}>
                  <Upload style={{ width: '1rem', height: '1rem' }} />
                  Save Content
                </Button>
                {section.content && (
                  <Button variant="secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="bg-gray-50 rounded-lg p-3" style={{ minHeight: '6.25rem' }}>
                <p className="text-sm text-gray-700">
                  {section.content.length > 200 
                    ? `${section.content.substring(0, 200)}...` 
                    : section.content}
                </p>
              </div>
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit Content
              </Button>
            </div>
          )}
        </div>

        {/* AI Analysis Results */}
        {section.isAnalyzed && section.summary && (
          <div className="bg-blue-50 rounded-lg p-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-blue-800">AI Analysis</h4>
              <Badge variant="success">{section.uniquenessScore}/100</Badge>
            </div>
            <p className="text-sm text-blue-700">{section.summary}</p>
          </div>
        )}

        {/* NFT Information */}
        {section.isMinted && section.nftAddress && (
          <div className="bg-green-50 rounded-lg p-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600" style={{ width: '1rem', height: '1rem' }} />
              <h4 className="font-medium text-green-800">NFT Minted Successfully</h4>
            </div>
            <div className="text-sm text-green-700" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <p className="font-mono">NFT: {section.nftAddress.slice(0, 8)}...{section.nftAddress.slice(-8)}</p>
              {section.solscanUrl && (
                <a
                  href={section.solscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-green-600 transition-colors"
                  style={{ textDecoration: 'none' }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#15803d'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#16a34a'}
                >
                  <ExternalLink style={{ width: '0.75rem', height: '0.75rem' }} />
                  View on Solscan
                </a>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {section.content && !section.isAnalyzed && (
            <Button
              onClick={() => onAnalyze(section.id)}
              disabled={isAnalyzing}
              loading={isAnalyzing}
              className="w-full"
            >
              <Brain style={{ width: '1rem', height: '1rem' }} />
              Analyze with AI
            </Button>
          )}

          {section.isAnalyzed && !section.isMinted && (
            <Button
              onClick={() => onMintNFT(section.id)}
              disabled={isMinting}
              loading={isMinting}
              variant="secondary"
              className="w-full"
            >
              <Shield style={{ width: '1rem', height: '1rem' }} />
              Mint as NFT
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};