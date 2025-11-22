import React, { useState, useMemo } from 'react';
import { Network } from './types';
import SuiDashboard from './features/sui/SuiDashboard';
import EvmDashboard from './features/evm/EvmDashboard';
import ConnectWalletButton from './components/ConnectWalletButton';
import { SuiLogo, BerachainLogo } from './components/icons/ChainLogos';
import HomePage from './HomePage';

const App: React.FC = () => {
  const [activeNetwork, setActiveNetwork] = useState<Network | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const isConnected = !!address;

  const networkConfig = useMemo(() => ({
    [Network.SUI]: {
      name: 'Sui',
      component: <SuiDashboard isConnected={isConnected} address={address} />,
      logo: <SuiLogo className="h-6 w-6" />,
      color: 'sui-blue',
      aurora: 'bg-sui-blue/30',
    },
    [Network.EVM]: {
      name: 'EVM / Web3',
      component: <EvmDashboard isConnected={isConnected} address={address} />,
      logo: <BerachainLogo className="h-6 w-6" />,
      color: 'berachain-orange',
      aurora: 'bg-berachain-orange/30',
    },
  }), [isConnected, address]);
  
  const currentDisplay = activeNetwork ? networkConfig[activeNetwork] : null;

  return (
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
          <button onClick={() => setActiveNetwork(null)} className="text-xl font-bold flex items-center gap-3 group">
            <span className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:from-white group-hover:to-white transition-all">DeFi Hub</span>
            {currentDisplay && (
              <span className={`px-2 py-1 rounded text-xs bg-${currentDisplay.color}/20 text-${currentDisplay.color}`}>
                {currentDisplay.name}
              </span>
            )}
          </button>
          <nav className="flex items-center gap-1 sm:gap-2 bg-base-800/80 p-1 rounded-full border border-white/10">
            {(Object.keys(networkConfig) as Network[]).map((network) => (
              <button
                key={network}
                onClick={() => setActiveNetwork(network)}
                title={networkConfig[network].name}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeNetwork === network
                    ? `bg-${networkConfig[network].color} text-black shadow-md shadow-${networkConfig[network].color}/30`
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
            onConnect={setAddress}
            onDisconnect={() => setAddress(null)}
            color={currentDisplay?.color || 'theme-yellow'}
          />
        </div>
      </header>
      <main>
        {activeNetwork === null ? (
          <HomePage onNavigateToDashboard={setActiveNetwork} />
        ) : (
          <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            {currentDisplay?.component}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;