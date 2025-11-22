import React from 'react';
import { WalletIcon, LogoutIcon } from './icons/InterfaceIcons';
import { Network } from '../types';


interface ConnectWalletButtonProps {
    activeNetwork: Network | null;
    address: string | null;
    color: string;
    onConnect: () => void;
    onDisconnect: () => void;
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ activeNetwork, address, color, onConnect, onDisconnect }) => {
  const isConnected = !!address;
  const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID'; // Keep this here for the check
  const isEvmConfigMissing = activeNetwork === Network.EVM && (!projectId || projectId === 'YOUR_WALLETCONNECT_PROJECT_ID');

  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  
  const colorClasses: { [key: string]: string } = {
    'sui-blue': 'from-sui-blue to-blue-400 hover:from-sui-blue/90 hover:to-blue-400/90',
    'iota-green': 'from-iota-green to-green-400 hover:from-iota-green/90 hover:to-green-400/90',
    'berachain-orange': 'from-berachain-orange to-orange-400 hover:from-berachain-orange/90 hover:to-orange-400/90',
    'theme-yellow': 'from-theme-yellow to-amber-400 hover:from-theme-yellow/90 hover:to-amber-400/90'
  };

  const buttonClass = colorClasses[color] || colorClasses['theme-yellow'];

  // Determine button text and title based on state
  let buttonText = "Connect Wallet";
  let buttonTitle = "Connect your wallet to the selected network";
  
  if (!activeNetwork) {
    buttonTitle = "Select a network first";
  } else if (isEvmConfigMissing) {
    buttonText = "Setup Required";
    buttonTitle = "Configuration Required: Please get your free projectId from cloud.walletconnect.com and add it to the App.tsx file.";
  }

  return (
    <div>
      {!isConnected ? (
        <button
          onClick={onConnect}
          disabled={!activeNetwork || isEvmConfigMissing}
          className={`flex items-center gap-2 bg-gradient-to-r ${buttonClass} text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:scale-100`}
          title={buttonTitle}
        >
          <WalletIcon className="h-5 w-5" />
          <span>{buttonText}</span>
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-base-800/80 border border-white/10 rounded-full p-1">
            <div className="bg-base-900 px-3 py-1 rounded-full">
                <p className="text-sm font-mono text-gray-300">{truncatedAddress}</p>
            </div>
          <button onClick={onDisconnect} title="Disconnect" className="p-2 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-full transition-colors">
            <LogoutIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectWalletButton;
