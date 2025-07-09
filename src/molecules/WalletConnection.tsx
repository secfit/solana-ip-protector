import React from 'react';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { CheckCircle, Shield, AlertCircle } from 'lucide-react';

interface WalletConnectionProps {
  connected: boolean;
  publicKey: string | null;
  balance: number;
}
// {publicKey ? `${publicKey.slice(0, 8)}...${publicKey.slice(-8)}` : 'Simulation Mode'}
export const WalletConnection: React.FC<WalletConnectionProps> = ({
  connected,
  publicKey,
  balance
}) => {
  if (!connected) {
    return (
      <Card title="Solana Devnet Connection" className="bg-blue-50 border-blue-200">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="icon-wrapper bg-blue-100">
              <Shield className="text-blue-600" style={{ width: '2rem', height: '2rem' }} />
            </div>
          </div>
          <div className="mb-4">
            <h4 className="font-semibold text-blue-900">Ready for Solana Devnet</h4>
            <p className="text-sm text-blue-700 mt-2">
              Add your private key to enable real blockchain transactions
            </p>
          </div>
          
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
            <div className="flex items-center gap-2 justify-center">
              <AlertCircle className="text-blue-600" style={{ width: '1rem', height: '1rem' }} />
              <p className="text-sm text-blue-800">
                <strong>Demo Mode:</strong> Currently using simulation for testing
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="icon-wrapper bg-green-100">
            <CheckCircle className="text-green-600" style={{ width: '1.25rem', height: '1.25rem' }} />
          </div>
          <div>
            <p className="font-medium text-green-800">Solana Devnet Connected</p>
            <p className="text-sm text-green-600">
              
			  {publicKey ? `${publicKey}` : 'Simulation Mode'}
            </p>
            <p className="text-xs text-green-500">
              Balance: {balance.toFixed(4)} SOL
            </p>
          </div>
        </div>
        <Badge variant="success">Ready</Badge>
      </div>
    </Card>
  );
};