import React, { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@suiet/wallet-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Network, Token } from '../../types';
import { ArrowDownIcon, LoadingSpinner, ChevronDownIcon } from '../../components/icons/InterfaceIcons';
import TokenSelectionModal from '../../components/TokenSelectionModal';

interface SwapProps {
  network: Network;
  color: string;
  isConnected: boolean;
  address: string | null;
}

const REAL_TOKENS: { [key in Network]: Token[] } = {
  [Network.SUI]: [
    { symbol: 'SUI', name: 'Sui', logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/sui/info/logo.png' },
    { symbol: 'USDC', name: 'USD Coin', logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png' },
    { symbol: 'WETH', name: 'Wrapped Ether', logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png' },
  ],
  [Network.IOTA]: [
    { symbol: 'IOTA', name: 'IOTA', logo: 'https://files.iota.org/media/smr_logo_dark.png' },
    { symbol: 'USDT', name: 'Tether', logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png' },
  ],
  [Network.EVM]: [
    { symbol: 'BERA', name: 'Berachain', logo: 'https://artio.bex.berachain.com/bera-token.svg' },
    { symbol: 'HONEY', name: 'Honey', logo: 'https://artio.bex.berachain.com/honey-token.svg' },
    { symbol: 'ETH', name: 'Ethereum', logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png' },
  ],
};


const Swap: React.FC<SwapProps> = ({ network, color, isConnected, address }) => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromBalance, setFromBalance] = useState<string | null>(null);
  const [toBalance, setToBalance] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'signing' | 'sending' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'from' | 'to' | null>(null);

  const tokens = useMemo(() => REAL_TOKENS[network], [network]);
  const [fromToken, setFromToken] = useState<Token>(tokens[0]);
  const [toToken, setToToken] = useState<Token>(tokens[1]);

  const { signAndExecuteTransactionBlock: signAndExecuteSuiTx } = useWallet();
  
  // Reset state on network change
  useEffect(() => {
    setFromToken(tokens[0]);
    setToToken(tokens[1]);
    setFromAmount('');
    setToAmount('');
    setTxHash('');
    setError('');
    setStatus('idle');
  }, [network, tokens]);

  // Fetch balances
  useEffect(() => {
    if (!isConnected || !address) {
      setFromBalance('0.0');
      setToBalance('0.0');
      return;
    }

    const fetchBalances = async () => {
        setFromBalance(null); // Set to null to indicate loading
        setToBalance(null);
        try {
            if (network === Network.EVM) { 
                const provider = new ethers.BrowserProvider((window as any).ethereum!);
                const balance = await provider.getBalance(address);
                setFromBalance(ethers.formatEther(balance).substring(0, 6));
                setToBalance((Math.random() * 1000).toFixed(2));
            } else if (network === Network.SUI || network === Network.IOTA) {
                await new Promise(res => setTimeout(res, 500)); // Simulate fetch delay for Sui and IOTA
                setFromBalance((Math.random() * 100).toFixed(2));
                setToBalance((Math.random() * 1000).toFixed(2));
            }
        } catch (e) {
            console.error("Failed to fetch balance:", e);
            setFromBalance('N/A');
            setToBalance('N/A');
        }
    };

    fetchBalances();
  }, [isConnected, address, network, fromToken, toToken]);

  const handleOpenModal = (type: 'from' | 'to') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleSelectToken = (token: Token) => {
    if (modalType === 'from') {
      if (token.symbol === toToken.symbol) {
        setToToken(fromToken); // Swap them
      }
      setFromToken(token);
    } else if (modalType === 'to') {
      if (token.symbol === fromToken.symbol) {
        setFromToken(toToken); // Swap them
      }
      setToToken(token);
    }
    setIsModalOpen(false);
    setModalType(null);
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0 || !isConnected || !address) return;
    
    setStatus('signing');
    setTxHash('');
    setError('');

    try {
        if (network === Network.EVM) {
            const provider = new ethers.BrowserProvider((window as any).ethereum!);
            const signer = await provider.getSigner();
            const tx = await signer.sendTransaction({
                to: address,
                value: ethers.parseEther("0.0001")
            });
            setStatus('sending');
            await tx.wait();
            setTxHash(tx.hash);
        } else if (network === Network.SUI) {
             if (!signAndExecuteSuiTx) {
                throw new Error("Sui wallet function not available.");
             }
             const txb = new TransactionBlock();
             const [coin] = txb.splitCoins(txb.gas, [txb.pure(1000)]); 
             txb.transferObjects([coin], txb.pure(address));
             
             setStatus('sending');

             const { digest } = await signAndExecuteSuiTx({
                transactionBlock: txb,
             });
             setTxHash(digest);
        } else if (network === Network.IOTA) {
            setStatus('sending');
            await new Promise(res => setTimeout(res, 1500)); // Simulate transaction
            setTxHash(`iota_mock_swap_${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`);
        }
        
        setStatus('success');
        setFromAmount('');
        setToAmount('');

    } catch (err: any) {
        console.error("Swap failed:", err);
        setError(err.message.includes('User denied') ? 'Transaction rejected by user.' : 'Transaction failed.');
        setStatus('error');
    }
  };
  
  const handleAmountChange = (value: string) => {
    setFromAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setToAmount((numValue * 1234.56).toFixed(2));
    } else {
      setToAmount('');
    }
  };

  const statusMessages: { [key: string]: string } = {
    idle: isConnected ? 'Swap' : 'Connect Wallet',
    signing: 'Waiting for confirmation...',
    sending: 'Swapping...',
    success: 'Swap Successful!',
    error: 'Try Again',
    loading: 'Loading...',
  };
  
  const bgColorClass = { 'sui-blue': 'bg-sui-blue', 'iota-green': 'bg-iota-green', 'berachain-orange': 'bg-berachain-orange' }[color] || 'bg-gray-500';
  const textColorClass = { 'sui-blue': 'text-sui-blue', 'iota-green': 'text-iota-green', 'berachain-orange': 'text-berachain-orange' }[color] || 'text-gray-500';

  const BalanceDisplay: React.FC<{ balance: string | null }> = ({ balance }) => {
    return (
        <span className="text-gray-400 text-sm flex items-center gap-1">
            Balance: {balance === null ? <LoadingSpinner className="h-4 w-4" /> : balance}
        </span>
    );
  };

  return (
    <>
      <TokenSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectToken}
        tokens={tokens}
        network={network}
      />
      <div className="bg-base-800/40 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl shadow-black/20 backdrop-blur-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
       <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Swap</h2>
        <span className="text-xs text-gray-400">on {network}</span>
      </div>

      <div className="bg-black/30 p-4 rounded-xl border border-white/5">
        <div className="flex justify-between items-end">
          <span className="text-gray-400 text-sm">You pay</span>
          <BalanceDisplay balance={fromBalance} />
        </div>
        <div className="flex justify-between items-center mt-2">
          <input
            type="number"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="bg-transparent text-3xl font-bold w-full outline-none"
          />
          <button onClick={() => handleOpenModal('from')} className="flex items-center gap-2 bg-base-700/50 p-2 rounded-full hover:bg-base-700/80 transition-colors">
            <img src={fromToken.logo} alt={`${fromToken.name} logo`} className="h-6 w-6 rounded-full" />
            <span className="font-semibold">{fromToken.symbol}</span>
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
      
      <div className="flex justify-center -my-6 z-10">
        <button onClick={handleSwapTokens} className={`bg-base-700 p-2 rounded-full border-4 border-base-800/80 ${textColorClass} hover:rotate-180 transition-transform duration-300`} aria-label="Swap tokens">
          <ArrowDownIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="bg-black/30 p-4 rounded-xl border border-white/5">
        <div className="flex justify-between items-end">
          <span className="text-gray-400 text-sm">You receive</span>
          <BalanceDisplay balance={toBalance} />
        </div>
        <div className="flex justify-between items-center mt-2">
          <input
            type="number"
            placeholder="0.0"
            value={toAmount}
            readOnly
            className="bg-transparent text-3xl font-bold w-full outline-none text-gray-400"
          />
           <button onClick={() => handleOpenModal('to')} className="flex items-center gap-2 bg-base-700/50 p-2 rounded-full hover:bg-base-700/80 transition-colors">
            <img src={toToken.logo} alt={`${toToken.name} logo`} className="h-6 w-6 rounded-full" />
            <span className="font-semibold">{toToken.symbol}</span>
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      <button
        onClick={handleSwap}
        disabled={status === 'signing' || status === 'sending' || !fromAmount || !isConnected}
        title={!isConnected ? "Please connect your wallet first" : ""}
        className={`w-full ${bgColorClass} text-black font-bold py-4 rounded-xl text-lg transition-all duration-300 disabled:bg-base-600 disabled:text-gray-500 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-2 transform hover:scale-[1.02] disabled:transform-none`}
      >
        {(status === 'signing' || status === 'sending') && <LoadingSpinner className="h-6 w-6" />}
        {statusMessages[status]}
      </button>

      {status === 'success' && txHash && (
        <div className="text-center text-sm bg-green-500/10 text-green-400 p-3 rounded-lg">
          <p>Swap Successful!</p>
          <a href="#" className="underline truncate block">View on explorer: {txHash.substring(0, 40)}...</a>
        </div>
      )}
      {status === 'error' && error && (
         <div className="text-center text-sm bg-red-500/10 text-red-400 p-3 rounded-lg">
          <p>{error}</p>
        </div>
      )}
    </div>
    </>
  );
};

export default Swap;