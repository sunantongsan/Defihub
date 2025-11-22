import React, { useState, useMemo, useEffect } from 'react';
import { Network } from './types';
import SuiDashboard from './features/sui/SuiDashboard';
import IotaDashboard from './features/iota/IotaDashboard';
import EvmDashboard from './features/evm/EvmDashboard';
import ConnectWalletButton from './components/ConnectWalletButton';
import SuiWalletSelectorModal from './components/SuiWalletSelectorModal';
import { SuiLogo, IotaLogo, BerachainLogo } from './components/icons/ChainLogos';
import HomePage from './HomePage';
import { getWallets, Wallet } from '@mysten/wallet-standard';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers';

// 1. Get a project ID from https://cloud.walletconnect.com
const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID'; // <-- IMPORTANT: REPLACE THIS

// --- Conditionally initialize Web3Modal ---
let web3Modal: ReturnType<typeof createWeb3Modal> | undefined;
const isEvmConfigured = projectId && projectId !== 'YOUR_WALLETCONNECT_PROJECT_ID';

if (isEvmConfigured) {
  const mainnet = { chainId: 1, name: 'Ethereum', currency: 'ETH', explorerUrl: 'https://etherscan.io', rpcUrl: 'https://cloudflare-eth.com' };
  const berachainTestnet = { chainId: 80085, name: 'Berachain Artio', currency: 'BERA', explorerUrl: 'https://artio.beratrail.io', rpcUrl: 'https://artio.rpc.berachain.com/' };
  const metadata = { name: 'DeFi Multi-Chain Hub', description: 'A cutting-edge DeFi Hub', url: 'https://defihub-phi.vercel.app/', icons: ['https://avatars.githubusercontent.com/u/37784886'] };
  const ethersConfig = defaultConfig({ metadata, defaultChainId: 1, rpcUrl: 'https://cloudflare-eth.com' });
  web3Modal = createWeb3Modal({ ethersConfig, chains: [mainnet, berachainTestnet], projectId, enableAnalytics: false });
}
// --- End of Conditional Initialization ---

const App: React.FC = () => {
  const [activeNetwork, setActiveNetwork] = useState<Network | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isSuiModalOpen, setIsSuiModalOpen] = useState(false);
  const [suiWallet, setSuiWallet] = useState<Wallet | null>(null);
  const isConnected = !!address;

  // Auto-reconnect effect for Sui
  useEffect(() => {
    if (activeNetwork === Network.SUI && !suiWallet) {
        const { get } = getWallets();
        const wallets = get();
        const connectedWallet = wallets.find(w => w.accounts.length > 0);
        if (connectedWallet) {
            setSuiWallet(connectedWallet);
            setAddress(connectedWallet.accounts[0].address);
        }
    }
  }, [activeNetwork, suiWallet]);


  const handleConnect = async (network: Network) => {
    try {
      if (network === Network.SUI) {
        setIsSuiModalOpen(true);
      } else if (network === Network.EVM) {
        if (web3Modal) {
          await web3Modal.open();
          web3Modal.subscribeProvider(({ address }) => {
            if (address) setAddress(address);
          });
        } else {
          alert("EVM wallet connection is not configured. Please set the WalletConnect projectId.");
        }
      } else if (network === Network.IOTA) {
        alert("IOTA wallet connection is for demonstration purposes only.");
        setAddress(`iota1qpm...${Math.random().toString(36).substring(2, 6)}`);
      }
    } catch (error) {
      console.error("Failed to initiate connection:", error);
      alert("Could not initiate wallet connection. See console for details.");
    }
  };
  
  const handleSuiSelectAndConnect = async (walletName: string) => {
    setIsSuiModalOpen(false);
    try {
        const { get } = getWallets();
        const wallets = get();
        const wallet = wallets.find(w => w.name === walletName);

        if (!wallet) {
            throw new Error(`Wallet ${walletName} not found.`);
        }

        // Check if already connected
        if (wallet.accounts.length > 0) {
            setSuiWallet(wallet);
            setAddress(wallet.accounts[0].address);
            return;
        }

        const connectFeature = wallet.features['sui:connect'];
        if (!connectFeature) {
             throw new Error(`The selected wallet "${wallet.name}" does not support the required connection standard.`);
        }

        // Use the modern, correct connection method that returns accounts.
        const { accounts } = await connectFeature.connect();

        if (accounts && accounts.length > 0) {
            setSuiWallet(wallet);
            setAddress(accounts[0].address);
        } else {
            throw new Error("Connection was approved, but no accounts were found.");
        }

    } catch (error) {
        console.error("Failed to connect to Sui wallet:", error);
        alert("Failed to connect wallet. See console for details.");
    }
  };

  const handleDisconnect = async () => {
    if (activeNetwork === Network.SUI && suiWallet) {
        const disconnectFeature = suiWallet.features['sui:disconnect'];
        if (disconnectFeature) {
            await disconnectFeature.disconnect();
        }
        setSuiWallet(null);
    } else if (activeNetwork === Network.EVM && web3Modal) {
      await web3Modal.disconnect();
    }
    setAddress(null);
  };

  const networkConfig = useMemo(() => ({
    [Network.SUI]: { name: 'Sui', component: <SuiDashboard isConnected={isConnected} address={address} />, logo: <SuiLogo className="h-6 w-6" />, color: 'sui-blue', aurora: 'bg-sui-blue/30' },
    [Network.IOTA]: { name: 'IOTA', component: <IotaDashboard isConnected={isConnected} address={address} />, logo: <IotaLogo className="h-6 w-6" />, color: 'iota-green', aurora: 'bg-iota-green/30' },
    [Network.EVM]: { name: 'EVM / Web3', component: <EvmDashboard isConnected={isConnected} address={address} />, logo: <BerachainLogo className="h-6 w-6" />, color: 'berachain-orange', aurora: 'bg-berachain-orange/30' },
  }), [isConnected, address]);

  const activeNavButtonStyles: { [key: string]: string } = {
    'sui-blue': 'bg-sui-blue text-black shadow-md shadow-sui-blue/30',
    'iota-green': 'bg-iota-green text-black shadow-md shadow-iota-green/30',
    'berachain-orange': 'bg-berachain-orange text-black shadow-md shadow-berachain-orange/30',
  };

  const networkTagStyles: { [key: string]: string } = {
    'sui-blue': 'bg-sui-blue/20 text-sui-blue',
    'iota-green': 'bg-iota-green/20 text-iota-green',
    'berachain-orange': 'bg-berachain-orange/20 text-berachain-orange',
  };

  const currentDisplay = activeNetwork ? networkConfig[activeNetwork] : null;

  return (
    <>
    <SuiWalletSelectorModal
        isOpen={isSuiModalOpen}
        onClose={() => setIsSuiModalOpen(false)}
        onSelectWallet={handleSuiSelectAndConnect}
    />
    <div className="relative min-h-screen bg-base-900 font-mono overflow-x-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className={`
            absolute -top-[20%] left-1/2 -translate-x-1/2
            w-[150vw] h-[50vh] rounded-full
            transition-colors duration-1000 ease-in-out
            ${currentDisplay ? currentDisplay.aurora : 'bg-theme-yellow/20'} 
            blur-[150px] animate-aurora
        `}/>
      </div>

      <header className="p-4 border-b border-white/10 bg-base-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <button onClick={() => { setActiveNetwork(null); if (isConnected) handleDisconnect(); }} className="text-xl font-bold flex items-center gap-3 group">
            <span className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:from-white group-hover:to-white transition-all">DeFi Hub</span>
            {currentDisplay && (
              <span className={`px-2 py-1 rounded text-xs ${networkTagStyles[currentDisplay.color]}`}>
                {currentDisplay.name}
              </span>
            )}
          </button>
          <nav className="flex items-center gap-1 sm:gap-2 bg-base-800/80 p-1 rounded-full border border-white/10">
            {(Object.keys(networkConfig) as Network[]).map((network) => (
              <button
                key={network}
                onClick={() => { if (activeNetwork !== network) { handleDisconnect(); } setActiveNetwork(network); }}
                title={networkConfig[network].name}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeNetwork === network
                    ? activeNavButtonStyles[networkConfig[network].color]
                    : 'text-gray-400 hover:bg-base-700/50 hover:text-white'
                }`}
              >
                {networkConfig[network].logo}
                <span className="hidden sm:inline">{networkConfig[network].name}</span>
              </button>
            ))}
          </nav>
          <ConnectWalletButton 
            activeNetwork={activeNetwork}
            address={address}
            onConnect={() => activeNetwork && handleConnect(activeNetwork)}
            onDisconnect={handleDisconnect}
            color={currentDisplay?.color || 'theme-yellow'}
          />
        </div>
      </header>
      <main>
        {activeNetwork === null ? (
          <HomePage onNavigateToDashboard={(network) => { setActiveNetwork(network); }} />
        ) : (
          <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            {currentDisplay?.component}
          </div>
        )}
      </main>
    </div>
    </>
  );
};

export default App;
