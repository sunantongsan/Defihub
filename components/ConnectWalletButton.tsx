import React, { useEffect } from 'react';
import { WalletIcon, LogoutIcon } from './icons/InterfaceIcons';
import { Network } from '../types';

// Extend window interface to include common wallet providers
declare global {
  interface Window {
    ethereum?: {
        request: (args: { method: string }) => Promise<string[]>;
    };
    suiWallet?: {
      request: (args: { method: string }) => Promise<{ accounts: string[] }>;
    };
    iotaWallet?: {
        request: (args: { method: string }) => Promise<{ accounts: string[] }>;
    };
  }
}

interface ConnectWalletButtonProps {
    activeNetwork: Network | null;
    address: string | null;
    color: string;
    onConnect: (address: string) => void;
    onDisconnect: () => void;
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ activeNetwork, address, color, onConnect, onDisconnect }) => {
  const isConnected = !!address;
  
  useEffect(() => {
    // Disconnect when network changes to ensure user connects with the right wallet for the new network
    onDisconnect();
  }, [activeNetwork, onDisconnect]);

  const handleConnect = async () => {
    if (!activeNetwork) {
      alert("Please select a network first.");
      return;
    }

    try {
      let accounts: string[] | undefined;
      switch (activeNetwork) {
        case Network.BERACHAIN: // EVM Compatible
          if (window.ethereum) {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          } else {
            alert("Please install MetaMask or another EVM-compatible wallet.");
          }
          break;
        case Network.SUI:
          if (window.suiWallet) {
            const res = await window.suiWallet.request({ method: 'sui_requestAccounts' });
            accounts = res.accounts;
          } else {
            alert("Please install a Sui wallet extension.");
          }
          break;
        case Network.IOTA:
           if (window.iotaWallet) {
            const res = await window.iotaWallet.request({ method: 'iota_requestAccounts' });
            accounts = res.accounts;
          } else {
            alert("Please install an IOTA-compatible wallet like TanglePay.");
          }
          break;
        default:
          alert("Selected network does not have wallet integration specified.");
      }

      if (accounts && accounts.length > 0) {
        onConnect(accounts[0]);
      }

    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. See console for details.");
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
  };

  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  
  const colorClasses: { [key: string]: string } = {
    'sui-blue': 'from-sui-blue to-blue-400 hover:from-sui-blue/90 hover:to-blue-400/90',
    'iota-green': 'from-iota-green to-teal-400 hover:from-iota-green/90 hover:to-teal-400/90',
    'berachain-orange': 'from-berachain-orange to-orange-400 hover:from-berachain-orange/90 hover:to-orange-400/90',
    'theme-yellow': 'from-theme-yellow to-amber-400 hover:from-theme-yellow/90 hover:to-amber-400/90'
  };

  const buttonClass = colorClasses[color] || colorClasses['theme-yellow'];

  return (
    <div>
      {!isConnected ? (
        <button
          onClick={handleConnect}
          disabled={!activeNetwork}
          className={`flex items-center gap-2 bg-gradient-to-r ${buttonClass} text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:scale-100`}
          title={!activeNetwork ? "Select a network to connect" : "Connect Wallet"}
        >
          <WalletIcon className="h-5 w-5" />
          <span>Connect Wallet</span>
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-base-800/80 border border-white/10 rounded-full p-1">
            <div className="bg-base-900 px-3 py-1 rounded-full">
                <p className="text-sm font-mono text-gray-300">{truncatedAddress}</p>
            </div>
          <button onClick={handleDisconnect} title="Disconnect" className="p-2 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-full transition-colors">
            <LogoutIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectWalletButton;