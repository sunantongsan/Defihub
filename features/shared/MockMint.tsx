import React, { useState } from 'react';
import { Network } from '../../types';
import { LoadingSpinner } from '../../components/icons/InterfaceIcons';

interface MockMintProps {
  network: Network;
  color: string;
  isConnected: boolean;
}

const MockMint: React.FC<MockMintProps> = ({ network, color, isConnected }) => {
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [supply, setSupply] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState('');

    const handleMint = () => {
        if (!name || !symbol || !supply || !isConnected) return;
        setIsLoading(true);
        setTxHash('');
        // In a real app, you would deploy a token contract here.
        setTimeout(() => {
            setIsLoading(false);
            setTxHash(`0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`);
            setName('');
            setSymbol('');
            setSupply('');
        }, 2000);
    };

    return (
        <div className="bg-base-800/40 border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl shadow-black/20 backdrop-blur-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
             <div className="text-center p-3 bg-yellow-500/10 text-yellow-400 rounded-lg text-sm">
                <strong>Note:</strong> This feature is for demonstration purposes only and does not create real transactions.
            </div>
            
            <h2 className="text-xl font-bold text-center">Create a new Token</h2>
            
            <div className="flex flex-col gap-4">
                <div>
                    <label className="text-sm text-gray-400">Token Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Awesome Token" className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-${color}`} />
                </div>
                 <div>
                    <label className="text-sm text-gray-400">Token Symbol</label>
                    <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="e.g. MAT" className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-${color}`} />
                </div>
                <div>
                    <label className="text-sm text-gray-400">Total Supply</label>
                    <input type="number" value={supply} onChange={(e) => setSupply(e.target.value)} placeholder="e.g. 1000000" className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-${color}`} />
                </div>
            </div>

            <button
                onClick={handleMint}
                disabled={isLoading || !name || !symbol || !supply || !isConnected}
                title={!isConnected ? "Please connect your wallet first" : ""}
                className={`w-full bg-${color} text-black font-bold py-3 rounded-xl text-lg transition-all duration-300 disabled:bg-base-600 disabled:text-gray-500 flex items-center justify-center gap-2 transform hover:scale-[1.02] disabled:transform-none`}
            >
                {isLoading ? <><LoadingSpinner className="h-6 w-6" /> Minting...</> : isConnected ? 'Mint Token' : 'Connect Wallet'}
            </button>
            
            {txHash && (
                <div className="text-center text-sm bg-green-500/10 text-green-400 p-3 rounded-lg">
                <p>Token Minted Successfully!</p>
                <a href="#" className="underline truncate block">View on explorer: {txHash.substring(0, 40)}...</a>
                </div>
            )}
        </div>
    );
};

export default MockMint;