import React from 'react';
import { useState } from 'react';
import { getWallets } from '@mysten/wallet-standard';
import { Network } from '../../types';
import { LoadingSpinner, ChevronDownIcon } from '../../components/icons/InterfaceIcons';
import { TransactionBlock } from '@mysten/sui.js/transactions';


interface MintProps {
  network: Network;
  color: string;
  isConnected: boolean;
  address: string | null;
}

// NOTE: These are placeholders. For this to work, you must deploy your own
// Move package for creating coins and replace these values with your package details.
const COIN_FACTORY_PACKAGE_ID = '0xYOUR_PACKAGE_ID_HERE'; // <-- REPLACE THIS
const COIN_FACTORY_MODULE_NAME = 'coin_factory'; // <-- REPLACE THIS (or your module name)


const Mint: React.FC<MintProps> = ({ network, color, isConnected, address }) => {
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [supply, setSupply] = useState('1000000');
    const [decimals, setDecimals] = useState('9'); // Sui coins typically have 9 decimals
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // New state for advanced options
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const [telegram, setTelegram] = useState('');
    const [website, setWebsite] = useState('');
    const [twitter, setTwitter] = useState('');
    const [revokeFreeze, setRevokeFreeze] = useState(true);
    const [revokeMint, setRevokeMint] = useState(false);

    const [status, setStatus] = useState<'idle' | 'signing' | 'sending' | 'success' | 'error'>('idle');
    const [txDigest, setTxDigest] = useState('');
    const [error, setError] = useState('');

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];

            if (file.size > 1 * 1024 * 1024) { // 1MB limit
                setError("Image file size should be less than 1MB.");
                // Clear the input
                event.target.value = ''; 
                setImagePreview(null);
                setImageUrl('');
                return;
            }
            setError('');

            // In a real app, you'd upload this to IPFS/Arweave and get a permanent URL
            const tempUrl = URL.createObjectURL(file); 
            setImageUrl(tempUrl);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setImageUrl('');
        // Also clear the file input for consistency
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
    }

    const handleMint = async () => {
        if (!isConnected || !address || !name || !symbol || !supply || !decimals) return;
        
        if(COIN_FACTORY_PACKAGE_ID === '0xYOUR_PACKAGE_ID_HERE') {
            alert("Configuration Error: Please update the `COIN_FACTORY_PACKAGE_ID` in `features/sui/Mint.tsx` with your deployed Move package ID.");
            return;
        }

        setStatus('signing');
        setTxDigest('');
        setError('');

        try {
            const walletsApi = getWallets();
            const suiWallets = walletsApi.get();
            if (suiWallets.length === 0) {
                throw new Error("Sui wallet not found.");
            }
            const wallet = suiWallets.find(w => w.accounts.some(a => a.address === address)) || suiWallets[0];

            if (!wallet) {
                throw new Error("Could not find the connected wallet.");
            }
            
            // This is now the REAL logic for creating a coin via a smart contract.
            // It assumes a Move function like `create_coin` exists in your package.
            const txb = new TransactionBlock();
            
            txb.moveCall({
                target: `${COIN_FACTORY_PACKAGE_ID}::${COIN_FACTORY_MODULE_NAME}::create_coin`,
                arguments: [
                    txb.pure(name),
                    txb.pure(symbol),
                    txb.pure(parseInt(decimals, 10)),
                    txb.pure(BigInt(supply) * BigInt(10 ** parseInt(decimals, 10))), // Adjust supply by decimals
                    txb.pure(description),
                    txb.pure(imageUrl),
                    txb.pure(revokeFreeze), // Pass the boolean value for revoking freeze authority
                    txb.pure(revokeMint),   // Pass the boolean value for revoking mint authority
                ],
            });
            
            setStatus('sending');

            const { digest } = await wallet.features['sui:signAndExecuteTransactionBlock'].signAndExecuteTransactionBlock({
                transactionBlock: txb,
            });
            
            setTxDigest(digest);
            setStatus('success');
            // Optionally reset form
            // setName(''); setSymbol(''); ... etc.

        } catch (err: any) {
            console.error("Minting failed:", err);
            const errorMessage = err.message || 'An unknown error occurred.';
            
            if (errorMessage.includes('User rejected')) {
                setError('Transaction Rejected. You cancelled the request in your wallet. Please try again when you are ready to approve.');
            } else if (errorMessage.includes('GasBalanceTooLow')) {
                setError('Insufficient Gas. You do not have enough SUI for transaction fees. Please add SUI to your wallet and try again.');
            } else if (errorMessage.includes('MoveAbort')) {
                setError('Invalid Parameters. The smart contract rejected the transaction. Please double-check all inputs (e.g., supply cannot be zero) and try again.');
            } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('timeout')) {
                setError('Network Error. Could not connect to the Sui network. Please check your internet connection and try again.');
            } else {
                setError('An unexpected error occurred. Please try again. If the problem persists, check the console for more details.');
            }
            setStatus('error');
        }
    };
    
    const statusMessages: { [key: string]: string } = {
        idle: isConnected ? 'Mint Token' : 'Connect Wallet',
        signing: 'Waiting for confirmation...',
        sending: 'Publishing Coin...',
        success: 'Transaction Successful!',
        error: 'Try Again',
    };

    return (
        <div className="bg-base-800/40 border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl shadow-black/20 backdrop-blur-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
             <div className="text-center p-3 bg-blue-500/10 text-sui-blue rounded-lg text-sm">
                <strong>Action Required:</strong> This feature will deploy a smart contract to create a new coin on the Sui network. This is a real transaction and will incur network fees (gas).
            </div>
            
            <h2 className="text-xl font-bold text-center">Publish New Coin on Sui</h2>
            
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-400">Token Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Awesome Token" className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-${color}`} />
                    </div>
                     <div>
                        <label className="text-sm text-gray-400">Token Symbol</label>
                        <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="e.g. MAT" className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-${color}`} />
                    </div>
                     <div>
                        <label className="text-sm text-gray-400">Decimals</label>
                        <input type="number" value={decimals} onChange={(e) => setDecimals(e.target.value)} placeholder="e.g. 9" className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-${color}`} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-400">Total Supply</label>
                        <input type="number" value={supply} onChange={(e) => setSupply(e.target.value)} placeholder="e.g. 1000000" className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-${color}`} />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-400">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your token" rows={3} className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-${color}`} />
                    </div>

                    <div className="md:col-span-2">
                         <label className="text-sm text-gray-400">Image</label>
                        <div className="mt-1 flex items-center gap-4">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Token preview" className="h-16 w-16 rounded-full object-cover bg-base-700" />
                            ) : (
                                <div className="h-16 w-16 rounded-full bg-black/30 border border-dashed border-white/10 flex items-center justify-center text-gray-500">
                                    Logo
                                </div>
                            )}
                            <div className='flex-grow'>
                                <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sui-blue/20 file:text-sui-blue hover:file:bg-sui-blue/30"/>
                                {imagePreview && (
                                     <button onClick={removeImage} className="text-xs text-red-400 hover:text-red-500 mt-2">Remove</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* More Options Section */}
                <div className="border-t border-white/10 pt-4">
                    <button onClick={() => setShowMoreOptions(!showMoreOptions)} className="flex justify-between items-center w-full text-gray-300 hover:text-white">
                        <span className="font-semibold">More Options</span>
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${showMoreOptions ? 'rotate-180' : ''}`} />
                    </button>
                    {showMoreOptions && (
                        <div className="mt-4 space-y-4">
                             <p className="text-xs text-center text-amber-400 bg-amber-500/10 p-2 rounded-md">
                                <strong>Tip:</strong> Most coin data cannot be changed after creation. Double-check all fields.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-400">Telegram link <span className="text-xs">(Optional)</span></label>
                                    <input type="text" value={telegram} onChange={e => setTelegram(e.target.value)} placeholder="https://t.me/..." className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-${color}`} />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">Website link <span className="text-xs">(Optional)</span></label>
                                    <input type="text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-${color}`} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm text-gray-400">Twitter or X link <span className="text-xs">(Optional)</span></label>
                                    <input type="text" value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="https://x.com/..." className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-${color}`} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5">
                                    <div>
                                        <span className="font-semibold">Revoke Freeze (required)</span>
                                        <p className="text-xs text-gray-400">Allows you to create a liquidity pool.</p>
                                    </div>
                                    <input type="checkbox" checked={revokeFreeze} onChange={e => setRevokeFreeze(e.target.checked)} className="h-5 w-5 rounded bg-base-700 text-sui-blue focus:ring-sui-blue" />
                                </label>
                                <label className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5">
                                    <div>
                                        <span className="font-semibold">Revoke Mint</span>
                                        <p className="text-xs text-gray-400">Prevents increasing the token supply later.</p>
                                    </div>
                                    <input type="checkbox" checked={revokeMint} onChange={e => setRevokeMint(e.target.checked)} className="h-5 w-5 rounded bg-base-700 text-sui-blue focus:ring-sui-blue" />
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center p-3 bg-amber-500/10 text-amber-400 rounded-lg text-sm my-4">
                <strong>Final Check:</strong> Clicking "Mint Token" will perform a real, irreversible transaction on the Sui network and will cost gas fees.
            </div>

            <button
                onClick={handleMint}
                disabled={status === 'signing' || status === 'sending' || !name || !symbol || !supply || !isConnected}
                title={!isConnected ? "Please connect your wallet first" : ""}
                className={`w-full bg-${color} text-black font-bold py-3 rounded-xl text-lg transition-all duration-300 disabled:bg-base-600 disabled:text-gray-500 flex items-center justify-center gap-2 transform hover:scale-[1.02] disabled:transform-none`}
            >
                {(status === 'signing' || status === 'sending') && <LoadingSpinner className="h-6 w-6" />}
                {statusMessages[status]}
            </button>
            
            {status === 'success' && txDigest && (
                <div className="text-center text-sm bg-green-500/10 text-green-400 p-3 rounded-lg">
                    <p>Coin Published Successfully!</p>
                    <a 
                        href={`https://suiscan.xyz/mainnet/tx/${txDigest}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="underline truncate block"
                    >
                        View on explorer: {txDigest.substring(0, 40)}...
                    </a>
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

export default Mint;