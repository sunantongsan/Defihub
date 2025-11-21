import React, { useState, useEffect } from 'react';
import { Network, Token } from '../../types';
import { ArrowDownIcon, LoadingSpinner } from '../../components/icons/InterfaceIcons';

interface MockSwapProps {
  network: Network;
  color: string;
  isConnected: boolean;
}

const MOCK_TOKENS: { [key in Network]: Token[] } = {
  [Network.SUI]: [{ symbol: 'SUI', name: 'Sui', logo: '💧' }, { symbol: 'USDC', name: 'USD Coin', logo: '💲' }, { symbol: 'WETH', name: 'Wrapped Ether', logo: '🦄' }],
  [Network.IOTA]: [{ symbol: 'IOTA', name: 'Iota', logo: '💡' }, { symbol: 'USDT', name: 'Tether', logo: '💲' }, { symbol: 'WBTC', name: 'Wrapped BTC', logo: '₿' }],
  [Network.BERACHAIN]: [{ symbol: 'BERA', name: 'Berachain', logo: '🐻' }, { symbol: 'HONEY', name: 'Honey', logo: '🍯' }, { symbol: 'STGUSDC', name: 'Stargate USDC', logo: '⭐' }],
};

const MockSwap: React.FC<MockSwapProps> = ({ network, color, isConnected }) => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  const tokens = MOCK_TOKENS[network];
  const [fromToken, setFromToken] = useState<Token>(tokens[0]);
  const [toToken, setToToken] = useState<Token>(tokens[1]);

  useEffect(() => {
    // Reset state when network changes to avoid stale data
    setFromToken(MOCK_TOKENS[network][0]);
    setToToken(MOCK_TOKENS[network][1]);
    setFromAmount('');
    setToAmount('');
    setTxHash('');
  }, [network]);


  const handleSwap = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0 || !isConnected) return;
    setIsLoading(true);
    setTxHash('');
    // In a real app, you would make a contract call here.
    setTimeout(() => {
      setIsLoading(false);
      setTxHash(`0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`);
      setFromAmount('');
      setToAmount('');
    }, 2000);
  };
  
  const handleAmountChange = (value: string) => {
    setFromAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      // Simulate price rate
      setToAmount((numValue * 1234.56).toFixed(2));
    } else {
      setToAmount('');
    }
  };

  const handleTokenSwap = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleFromTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSymbol = e.target.value;
    const newFromToken = tokens.find(t => t.symbol === newSymbol)!;
    if (newFromToken.symbol === toToken.symbol) {
        setToToken(fromToken); // Swap tokens
    }
    setFromToken(newFromToken);
  };

  const handleToTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSymbol = e.target.value;
    const newToToken = tokens.find(t => t.symbol === newSymbol)!;
    if (newToToken.symbol === fromToken.symbol) {
        setFromToken(toToken); // Swap tokens
    }
    setToToken(newToToken);
  };

  return (
    <div className="bg-base-800/40 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl shadow-black/20 backdrop-blur-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Swap</h2>
        <span className="text-xs text-gray-400">on {network}</span>
      </div>

      <div className="bg-black/30 p-4 rounded-xl border border-white/5">
        <div className="flex justify-between items-end">
          <span className="text-gray-400 text-sm">You pay</span>
          <span className="text-gray-400 text-sm">Balance: {isConnected ? '12.34' : 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <input
            type="number"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="bg-transparent text-3xl font-bold w-full outline-none"
          />
          <div className="relative flex items-center gap-2 bg-base-700/50 p-2 rounded-full cursor-pointer">
            <span className="text-2xl pointer-events-none">{fromToken.logo}</span>
            <span className="font-semibold pointer-events-none pr-1">{fromToken.symbol}</span>
             <select
                value={fromToken.symbol}
                onChange={handleFromTokenChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                aria-label="Select token to pay"
            >
                {tokens.map(t => <option key={`from-${t.symbol}`} value={t.symbol}>{t.name}</option>)}
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center -my-6 z-10">
        <button onClick={handleTokenSwap} className={`bg-base-700 p-2 rounded-full border-4 border-base-800/80 text-${color} hover:rotate-180 transition-transform duration-300`} aria-label="Swap tokens">
          <ArrowDownIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="bg-black/30 p-4 rounded-xl border border-white/5">
        <div className="flex justify-between items-end">
          <span className="text-gray-400 text-sm">You receive</span>
          <span className="text-gray-400 text-sm">Balance: {isConnected ? '567.89' : 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <input
            type="number"
            placeholder="0.0"
            value={toAmount}
            readOnly
            className="bg-transparent text-3xl font-bold w-full outline-none text-gray-400"
          />
           <div className="relative flex items-center gap-2 bg-base-700/50 p-2 rounded-full cursor-pointer">
            <span className="text-2xl pointer-events-none">{toToken.logo}</span>
            <span className="font-semibold pointer-events-none pr-1">{toToken.symbol}</span>
             <select
                value={toToken.symbol}
                onChange={handleToTokenChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                aria-label="Select token to receive"
            >
                {tokens.map(t => <option key={`to-${t.symbol}`} value={t.symbol}>{t.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleSwap}
        disabled={isLoading || !fromAmount || !isConnected}
        title={!isConnected ? "Please connect your wallet first" : ""}
        className={`w-full bg-${color} text-black font-bold py-4 rounded-xl text-lg transition-all duration-300 disabled:bg-base-600 disabled:text-gray-500 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-2 transform hover:scale-[1.02] disabled:transform-none`}
      >
        {isLoading ? <><LoadingSpinner className="h-6 w-6" /> Swapping...</> : isConnected ? 'Swap' : 'Connect Wallet'}
      </button>

      {txHash && (
        <div className="text-center text-sm bg-green-500/10 text-green-400 p-3 rounded-lg">
          <p>Swap Successful!</p>
          <a href="#" className="underline truncate block">View on explorer: {txHash.substring(0, 40)}...</a>
        </div>
      )}
    </div>
  );
};

export default MockSwap;