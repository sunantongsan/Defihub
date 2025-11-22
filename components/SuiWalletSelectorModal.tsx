import React from 'react';
import { useWallet } from '@suiet/wallet-kit';
import { CloseIcon } from './icons/InterfaceIcons';

interface SuiWalletSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuiWalletSelectorModal: React.FC<SuiWalletSelectorModalProps> = ({ isOpen, onClose }) => {
  const { wallets, select, connecting, connected } = useWallet();

  const handleSelectWallet = async (walletName: string) => {
    try {
      if (!connected) {
        await select(walletName);
      }
      onClose();
    } catch (error) {
      console.error('Failed to select and connect wallet', error);
      alert('Failed to connect wallet. See console for details.');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-base-900/70 border border-white/10 rounded-2xl w-full max-w-xs flex flex-col backdrop-blur-2xl shadow-2xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-bold">Select Sui Wallet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-2">
          {wallets.length > 0 ? (
            <ul className="space-y-1">
              {wallets.map((wallet) => (
                <li key={wallet.name}>
                  <button
                    onClick={() => handleSelectWallet(wallet.name)}
                    disabled={connecting}
                    className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-base-700/50 transition-colors text-left disabled:opacity-50"
                  >
                    <img src={wallet.icon} alt={`${wallet.name} logo`} className="h-8 w-8 rounded-full" />
                    <span className="font-semibold text-white">{wallet.name}</span>
                    {connecting && wallet.name === wallets.find(w => w.name === wallet.name)?.name && 
                        <span className="text-xs text-gray-400 ml-auto">Connecting...</span>
                    }
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-400 py-8">
              No Sui wallets detected. Please install a Sui wallet extension and refresh the page.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuiWalletSelectorModal;