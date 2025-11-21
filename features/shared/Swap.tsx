import React, { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Network, Token } from '../../types';
import { ArrowDownIcon, LoadingSpinner } from '../../components/icons/InterfaceIcons';

interface SwapProps {
  network: Network;
  color: string;
  isConnected: boolean;
  address: string | null;
}

// NOTE: In a real-world app, these would come from a token list or API.
// Using placeholder contract addresses for demonstration.
const REAL_TOKENS: { [key in Network]: Token[] } = {
  [Network.SUI]: [
    { symbol: 'SUI', name: 'Sui', logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/sui/info/logo.png' },
    { symbol: 'USDC', name: 'USD Coin', logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png' },
  ],
  [Network.IOTA]: [
    { symbol: 'IOTA', name: 'Iota', logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/iota/info/logo.png' },
    { symbol: 'USDT', name: 'Tether', logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png' },
  ],
  [Network.EVM]: [
    { symbol: 'BERA', name: 'Berachain', logo: 'https://artio.bex.berachain.com/bera-token.svg' },
    { symbol: 'HONEY', name: 'Honey', logo: 'https://artio.bex.berachain.com/honey-token.svg' },
  ],
};


const Swap: React.FC<SwapProps> = ({ network, color, isConnected, address }) => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromBalance, setFromBalance] = useState('0.0');
  const [toBalance, setToBalance] = useState('0.0');
  const [status, setStatus] = useState<'idle' | 'loading' | 'signing' | 'sending' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const tokens = useMemo(() => REAL_TOKENS[network], [network]);
  const [fromToken, setFromToken] = useState<Token>(tokens[0]);
  const [toToken, setToToken] = useState<Token>(tokens[1]);
  
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
        // In a real app, you would use token contract addresses and ABIs to get balances.
        // For this demo, we'll simulate fetching native token balances.
        try {
            if (network === Network.EVM || network === Network.IOTA) { // Assuming IOTA has an EVM layer
                const provider = new ethers.BrowserProvider(window.ethereum!);
                const balance = await provider.getBalance(address);
                // We'll set the native token balance for both for simplicity
                setFromBalance(ethers.formatEther(balance).substring(0, 6));
                setToBalance((Math.random() * 1000).toFixed(2)); // Mock other token balance
            } else if (network === Network.SUI) {
                // Sui balance fetching would require a Sui RPC client
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


  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0 || !isConnected || !address) return;
    
    setStatus('signing');
    setTxHash('');
    setError('');

    try {
        // This is a DEMONSTRATION of a transaction.
        // A real swap requires interacting with a specific DEX/AMM contract.
        // We will simulate this by sending a small amount of the native currency to ourselves.
        if (network === Network.EVM || network === Network.IOTA) {
            const provider = new ethers.BrowserProvider(window.ethereum!);
            const signer = await provider.getSigner();
            const tx = await signer.sendTransaction({
                to: address,
                value: ethers.parseEther("0.0001") // Send a tiny amount for demo
            });
            setStatus('sending');
            await tx.wait();
            setTxHash(tx.hash);

        } else if (network === Network.SUI) {
             alert("Sui transaction signing is not fully implemented in this demo. This would require the Sui dApp kit.");
             // Placeholder for Sui transaction logic
             const txb = new TransactionBlock();
             const [coin] = txb.splitCoins(txb.gas, [txb.pure(1000)]); // demo
             txb.transferObjects([coin], txb.pure(address));
             // In a real app with Sui dApp kit:
             // const { digest } = await signAndExecuteTransactionBlock({ transactionBlock: txb });
             // setTxHash(digest);
             throw new Error("Sui signing not implemented.");
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
      setToAmount((numValue * 1234.56).toFixed(2)); // Simulate price rate
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

  return (
    <div className="bg-base-800/40 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl shadow-black/20 backdrop-blur-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
       <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Swap</h2>
        <span className="text-xs text-gray-400">on {network}</span>
      </div>

      <div className="bg-black/30 p-4 rounded-xl border border-white/5">
        <div className="flex justify-between items-end">
          <span className="text-gray-400 text-sm">You pay</span>
          <span className="text-gray-400 text-sm">Balance: {fromBalance}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <input
            type="number"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="bg-transparent text-3xl font-bold w-full outline-none"
          />
          <div className="relative flex items-center gap-2 bg-base-700/50 p-2 rounded-full">
            <img src={fromToken.logo} alt={`${fromToken.name} logo`} className="h-6 w-6 rounded-full" />
            <span className="font-semibold pr-1">{fromToken.symbol}</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center -my-6 z-10">
        <button className={`bg-base-700 p-2 rounded-full border-4 border-base-800/80 text-${color} hover:rotate-180 transition-transform duration-300`} aria-label="Swap tokens">
          <ArrowDownIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="bg-black/30 p-4 rounded-xl border border-white/5">
        <div className="flex justify-between items-end">
          <span className="text-gray-400 text-sm">You receive</span>
          <span className="text-gray-400 text-sm">Balance: {toBalance}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <input
            type="number"
            placeholder="0.0"
            value={toAmount}
            readOnly
            className="bg-transparent text-3xl font-bold w-full outline-none text-gray-400"
          />
           <div className="relative flex items-center gap-2 bg-base-700/50 p-2 rounded-full">
            <img src={toToken.logo} alt={`${toToken.name} logo`} className="h-6 w-6 rounded-full" />
            <span className="font-semibold pr-1">{toToken.symbol}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleSwap}
        disabled={status === 'signing' || status === 'sending' || !fromAmount || !isConnected}
        title={!isConnected ? "Please connect your wallet first" : ""}
        className={`w-full bg-${color} text-black font-bold py-4 rounded-xl text-lg transition-all duration-300 disabled:bg-base-600 disabled:text-gray-500 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-2 transform hover:scale-[1.02] disabled:transform-none`}
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
  );
};

export default Swap;