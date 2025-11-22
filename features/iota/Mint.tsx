import React from 'react';
import { useState } from 'react';
import { Network } from '../../types';
import { LoadingSpinner, ChevronDownIcon } from '../../components/icons/InterfaceIcons';

interface MintProps {
  network: Network;
  color: string;
  isConnected: boolean;
  address: string | null;
}

const Mint: React.FC<MintProps> = ({ network, color, isConnected, address }) => {
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [supply, setSupply] = useState('1000000');
    const [decimals, setDecimals] = useState('6');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const [telegram, setTelegram] = useState('');
    const [website, setWebsite] = useState('');
    const [twitter, setTwitter] = useState('');
    const [revokeFreeze, setRevokeFreeze] = useState(true);
    const [revokeMint, setRevokeMint] = useState(false);

    const [status, setStatus] = useState<'idle' | 'signing' | 'sending' | 'success' | 'error'>('idle');
    const [txHash, setTxHash] = useState('');
    const [error, setError] = useState('');

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];

            if (file.size > 1 * 1024 * 1024) { // 1MB limit
                setError("Image file size should be less than 1MB.");
                event.target.value = ''; 
                setImagePreview(null);
                setImageUrl('');
                return;
            }
            setError('');

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
        const fileInput = document.getElementById('image-upload-iota') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
    }

    const handleMint = async () => {
        if (!isConnected || !address || !name || !symbol || !supply || !decimals) return;

        setStatus('sending');
        setTxHash('');
        setError('');

        // Mock transaction logic for IOTA
        setTimeout(() => {
            setStatus('success');
            setTxHash(`iota_mock_${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`);
        }, 2500);
    };
    
    const statusMessages: { [key: string]: string } = {
        idle: isConnected ? 'Mint Token' : 'Connect Wallet',
        signing: 'Waiting for confirmation...',
        sending: 'Minting Token...',
        success: 'Transaction Successful!',
        error: 'Try Again',
    };

    const ringColorClass = 'focus:ring-iota-green';
    const bgColorClass = 'bg-iota-green';
    const fileInputColorClass = 'file:bg-iota-green/20 file:text-iota-green hover:file:bg-iota-green/30';
    const checkboxColorClass = 'text-iota-green focus:ring-iota-green';

    return (
        <div className="bg-base-800/40 border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl shadow-black/20 backdrop-blur-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <div className="text-center p-3 bg-yellow-500/10 text-yellow-400 rounded-lg text-sm">
                <strong>Note:</strong> This IOTA feature is for demonstration purposes only and does not create real transactions.
            </div>
            
            <h2 className="text-xl font-bold text-center">Create a new Token on IOTA</h2>
            
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-400">Token Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tangle Token" className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 ${ringColorClass}`} />
                    </div>
                     <div>
                        <label className="text-sm text-gray-400">Token Symbol</label>
                        <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="e.g. TANGLE" className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 ${ringColorClass}`} />
                    </div>
                     <div>
                        <label className="text-sm text-gray-400">Decimals</label>
                        <input type="number" value={decimals} onChange={(e) => setDecimals(e.target.value)} placeholder="e.g. 6" className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 ${ringColorClass}`} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-400">Total Supply</label>
                        <input type="number" value={supply} onChange={(e) => setSupply(e.target.value)} placeholder="e.g. 1000000" className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 ${ringColorClass}`} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm text-gray-400">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your token" rows={3} className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 ${ringColorClass}`} />
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
                                <input id="image-upload-iota" type="file" accept="image/*" onChange={handleImageUpload} className={`block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${fileInputColorClass}`}/>
                                {imagePreview && (
                                     <button onClick={removeImage} className="text-xs text-red-400 hover:text-red-500 mt-2">Remove</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

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
                                    <input type="text" value={telegram} onChange={e => setTelegram(e.target.value)} placeholder="https://t.me/..." className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 ${ringColorClass}`} />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">Website link <span className="text-xs">(Optional)</span></label>
                                    <input type="text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 ${ringColorClass}`} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm text-gray-400">Twitter or X link <span className="text-xs">(Optional)</span></label>
                                    <input type="text" value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="https://x.com/..." className={`w-full bg-black/30 border border-white/5 p-3 rounded-lg mt-1 outline-none focus:ring-2 ${ringColorClass}`} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5">
                                    <div>
                                        <span className="font-semibold">Revoke Freeze (required)</span>
                                        <p className="text-xs text-gray-400">Allows you to create a liquidity pool.</p>
                                    </div>
                                    <input type="checkbox" checked={revokeFreeze} onChange={e => setRevokeFreeze(e.target.checked)} className={`h-5 w-5 rounded bg-base-700 ${checkboxColorClass}`} />
                                </label>
                                <label className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5">
                                    <div>
                                        <span className="font-semibold">Revoke Mint</span>
                                        <p className="text-xs text-gray-400">Prevents increasing the token supply later.</p>
                                    </div>
                                    <input type="checkbox" checked={revokeMint} onChange={e => setRevokeMint(e.target.checked)} className={`h-5 w-5 rounded bg-base-700 ${checkboxColorClass}`} />
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center p-3 bg-amber-500/10 text-amber-400 rounded-lg text-sm my-4">
                <strong>Final Check:</strong> Please review all token details before proceeding with the mock transaction.
            </div>

            <button
                onClick={handleMint}
                disabled={status === 'sending' || !name || !symbol || !supply || !isConnected}
                title={!isConnected ? "Please connect your wallet first" : ""}
                className={`w-full ${bgColorClass} text-black font-bold py-3 rounded-xl text-lg transition-all duration-300 disabled:bg-base-600 disabled:text-gray-500 flex items-center justify-center gap-2 transform hover:scale-[1.02] disabled:transform-none`}
            >
                {(status === 'sending') && <LoadingSpinner className="h-6 w-6" />}
                {statusMessages[status]}
            </button>
            
            {status === 'success' && txHash && (
                <div className="text-center text-sm bg-green-500/10 text-green-400 p-3 rounded-lg">
                    <p>Mock Token Minted Successfully!</p>
                    <p className="underline truncate block">
                        Mock Tx: {txHash.substring(0, 40)}...
                    </p>
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
