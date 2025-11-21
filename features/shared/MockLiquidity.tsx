import React, { useState } from 'react';
import { Network } from '../../types';
import { PlusCircleIcon, LoadingSpinner } from '../../components/icons/InterfaceIcons';

interface MockLiquidityProps {
  network: Network;
  color: string;
  isConnected: boolean;
}

const MockLiquidity: React.FC<MockLiquidityProps> = ({ network, color, isConnected }) => {
    const [amountA, setAmountA] = useState('');
    const [amountB, setAmountB] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasPosition, setHasPosition] = useState(false);
    const [message, setMessage] = useState('');

    const handleAddLiquidity = () => {
        if (!amountA || !amountB || !isConnected) return;
        setIsLoading(true);
        setMessage('');
        // In a real app, you would make a contract call here to add liquidity.
        setTimeout(() => {
            setIsLoading(false);
            setHasPosition(true);
            setMessage('Liquidity added successfully!');
            setAmountA('');
            setAmountB('');
        }, 2000);
    };
    
    const handleRemoveLiquidity = () => {
        if (!isConnected) return;
        setIsLoading(true);
        setMessage('');
        // In a real app, you would make a contract call here to remove liquidity.
        setTimeout(() => {
            setIsLoading(false);
            setHasPosition(false);
            setMessage('Liquidity removed successfully!');
        }, 2000);
    };
    
    // In a real app, you would fetch the user's positions from the blockchain.
    // We'll just show the "Add" form if they are not connected.
    const showPosition = isConnected && hasPosition;

    return (
        <div className="bg-base-800/40 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl shadow-black/20 backdrop-blur-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <h2 className="text-xl font-bold text-center">Liquidity Pool</h2>
            
            {!showPosition ? (
                 <div className="flex flex-col gap-4">
                    {!isConnected ? (
                        <p className="text-center text-gray-400 py-8">Connect your wallet to manage liquidity.</p>
                    ) : (
                        <>
                            <p className="text-center text-gray-400">You don't have any liquidity positions.</p>
                            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                <label className="text-sm text-gray-400">Token A Amount</label>
                                <input type="number" value={amountA} onChange={(e) => setAmountA(e.target.value)} placeholder="0.0" className="bg-transparent text-2xl w-full outline-none mt-1" />
                            </div>
                            <div className="flex justify-center text-gray-400">
                                <PlusCircleIcon className="w-8 h-8"/>
                            </div>
                            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                <label className="text-sm text-gray-400">Token B Amount</label>
                                <input type="number" value={amountB} onChange={(e) => setAmountB(e.target.value)} placeholder="0.0" className="bg-transparent text-2xl w-full outline-none mt-1" />
                            </div>
                            <button
                                onClick={handleAddLiquidity}
                                disabled={isLoading || !amountA || !amountB || !isConnected}
                                title={!isConnected ? "Please connect your wallet first" : ""}
                                className={`w-full bg-${color} text-black font-bold py-3 rounded-xl text-lg transition-all duration-300 disabled:bg-base-600 disabled:text-gray-500 flex items-center justify-center gap-2 transform hover:scale-[1.02] disabled:transform-none`}
                            >
                                {isLoading ? <><LoadingSpinner className="h-6 w-6" /> Adding...</> : 'Add Liquidity'}
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-4 text-center">
                    <h3 className="text-lg font-semibold">Your Position</h3>
                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                        <p className="text-gray-400">LP Tokens</p>
                        <p className="text-2xl font-bold">123.45</p>
                    </div>
                     <button
                        onClick={handleRemoveLiquidity}
                        disabled={isLoading || !isConnected}
                        title={!isConnected ? "Please connect your wallet first" : ""}
                        className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-lg transition-all duration-300 disabled:bg-base-600 disabled:text-gray-500 flex items-center justify-center gap-2 transform hover:scale-[1.02] disabled:transform-none`}
                    >
                         {isLoading ? <><LoadingSpinner className="h-6 w-6" /> Removing...</> : 'Remove Liquidity'}
                    </button>
                </div>
            )}
             {message && (
                <div className="text-center text-sm bg-green-500/10 text-green-400 p-3 rounded-lg">
                    {message}
                </div>
            )}
        </div>
    );
};

export default MockLiquidity;