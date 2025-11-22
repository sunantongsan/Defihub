import React, { useEffect, useCallback } from 'react';
import { getWallets } from '@mysten/wallet-standard';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers';
import { WalletIcon, LogoutIcon } from './icons/InterfaceIcons';
import { Network } from '../types';

// 1. Get a project ID from https://cloud.walletconnect.com
const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID'; // <-- IMPORTANT: REPLACE THIS

// --- Conditionally initialize Web3Modal ---
let web3Modal: ReturnType<typeof createWeb3Modal> | undefined;
const isEvmConfigured = projectId && projectId !== 'YOUR_WALLETCONNECT_PROJECT_ID';

if (isEvmConfigured) {
  // 2. Set chains
  const mainnet = {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://cloudflare-eth.com'
  };

  const berachainTestnet = {
      chainId: 80085,
      name: 'Berachain Artio',
      currency: 'BERA',
      explorerUrl: 'https://artio.beratrail.io',
      rpcUrl: 'https://artio.rpc.berachain.com/'
  };

  // 3. Create modal config
  const metadata = {
    name: 'DeFi Multi-Chain Hub',
    description: 'A cutting-edge DeFi Hub for multiple blockchains.',
    url: 'https://defihub-phi.vercel.app/', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  };

  const ethersConfig = defaultConfig({
    metadata,
    defaultChainId: 1,
    rpcUrl: 'https://cloudflare-eth.com',
  });

  web3Modal = createWeb3Modal({
    ethersConfig,
    chains: [mainnet, berachainTestnet],
    projectId,
    enableAnalytics: false // Optional - defaults to your Cloud configuration
  });
}
// --- End of Conditional Initialization ---


interface ConnectWalletButtonProps {
    activeNetwork: Network | null;
    address: string | null;
    color: string;
    onConnect: (address: string) => void;
    onDisconnect: () => void;
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ activeNetwork, address, color, onConnect, onDisconnect }) => {
  const isConnected = !!address;
  
  const handleDisconnectCallback = useCallback(onDisconnect, []);

  // Subscribe to Web3Modal address changes
  useEffect(() => {
    if (!web3Modal) return; // Do nothing if modal is not configured

    const unsubscribe = web3Modal.subscribeProvider( (newState) => {
        if(newState.address && activeNetwork === Network.EVM) {
            onConnect(newState.address);
        } else {
             handleDisconnectCallback();
        }
    });
    return () => unsubscribe();
  }, [activeNetwork, onConnect, handleDisconnectCallback]);


  useEffect(() => {
    // Disconnect when network changes to ensure user connects with the right wallet for the new network
    handleDisconnectCallback();
  }, [activeNetwork, handleDisconnectCallback]);

  // Check if the configuration is missing for the EVM network.
  const isEvmConfigMissing = activeNetwork === Network.EVM && !isEvmConfigured;

  const handleConnect = async () => {
    if (!activeNetwork || (activeNetwork === Network.EVM && !isEvmConfigured)) {
      return;
    }

    try {
      if (activeNetwork === Network.EVM) {
        if (web3Modal) {
          await web3Modal.open();
        } else {
           console.error("Web3Modal is not configured. A valid projectId is required.");
           alert("SETUP REQUIRED: Please get your free projectId from https://cloud.walletconnect.com and add it to the 'components/ConnectWalletButton.tsx' file.");
        }
      } else if (activeNetwork === Network.SUI) {
        const walletsApi = getWallets();
        const suiWallets = walletsApi.get();
        
        if (suiWallets.length === 0) {
            alert("Sui wallet not detected. Please ensure it's installed and enabled in your browser.");
            return;
        }

        const wallet = suiWallets[0];
        await wallet.features['sui:connect'].connect();
        const accounts = wallet.accounts.map(acc => acc.address);
        if (accounts && accounts.length > 0) {
          onConnect(accounts[0]);
        }
      }

    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. See console for details.");
    }
  };

  const handleDisconnect = async () => {
    if(activeNetwork === Network.SUI) {
      const walletsApi = getWallets();
      const suiWallets = walletsApi.get();
      if (suiWallets.length > 0 && suiWallets[0].features['sui:disconnect']) {
        await suiWallets[0].features['sui:disconnect'].disconnect();
      }
    } else if (activeNetwork === Network.EVM) {
      if (web3Modal) {
        await web3Modal.disconnect();
      }
    }
    onDisconnect();
  };

  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  
  const colorClasses: { [key: string]: string } = {
    'sui-blue': 'from-sui-blue to-blue-400 hover:from-sui-blue/90 hover:to-blue-400/90',
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
    buttonTitle = "Configuration Required: Please get your free projectId from cloud.walletconnect.com and add it to the ConnectWalletButton.tsx file.";
  }

  return (
    <div>
      {!isConnected ? (
        <button
          onClick={handleConnect}
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
          <button onClick={handleDisconnect} title="Disconnect" className="p-2 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-full transition-colors">
            <LogoutIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectWalletButton;