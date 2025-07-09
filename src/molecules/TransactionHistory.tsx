import React from 'react';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';

export interface Transaction {
  id: string;
  type: 'paper_init' | 'section_token';
  signature: string;
  explorerUrl: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  sectionType?: string;
  amount?: number;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return null;
  }

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Confirmed</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  const getTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'paper_init':
        return 'Paper Initialization';
      case 'section_token':
        return `${transaction.sectionType} NFT Creation`;
      default:
        return 'Unknown Transaction';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateSignature = (signature: string) => {
    return `${signature.slice(0, 8)}...${signature.slice(-8)}`;
  };

  return (
    <Card title="Blockchain Transaction History">
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-colors"
            style={{ cursor: 'default' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(transaction.status)}
              <div>
                <h4 className="font-medium text-gray-900">
                  {getTransactionTitle(transaction)}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Signature: {truncateSignature(transaction.signature)}</span>
                  <a
                    href={transaction.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 transition-colors"
                    style={{ textDecoration: 'none' }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#1d4ed8'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#2563eb'}
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on Solana Explorer
                  </a>
                </div>
                <p className="text-xs text-gray-500">
                  {formatTimestamp(transaction.timestamp)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {transaction.amount && (
                <span className="text-sm text-gray-600">
                  {transaction.amount} SOL
                </span>
              )}
              {getStatusBadge(transaction.status)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Solana Explorer:</strong> All transactions are recorded on Solana devnet. 
          Click "View on Solana Explorer\" to see detailed transaction information including 
          gas fees, block confirmation, and account interactions. Each NFT creates a unique 
          data account that serves as immutable proof of intellectual property ownership.
        </p>
      </div>
    </Card>
  );
};