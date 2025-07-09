import React from 'react';
import { Badge } from '../atoms/Badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  section: string;
  showIcon?: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  score, 
  section, 
  showIcon = true 
}) => {
  const getScoreVariant = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'info';
    return 'error';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="w-4 h-4" />;
    if (score >= 40) return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        {showIcon && getScoreIcon(score)}
        <span className="font-medium text-gray-700">{section}</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={getScoreVariant(score)}>
          {score}/100
        </Badge>
      </div>
    </div>
  );
};