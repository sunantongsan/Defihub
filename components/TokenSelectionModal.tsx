import React, { useState, useMemo } from 'react';
import { Token, Network } from '../types';
import { CloseIcon, SearchIcon } from './icons/InterfaceIcons';

interface TokenSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  tokens: Token[];
  network: Network;
}

const TokenSelectionModal: React.FC<TokenSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  tokens,
  network,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTokens = useMemo(() => {
    return tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tokens, searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-base-900/70 border border-white/10 rounded-2xl w-full max-w-md max-h-[70vh] flex flex-col backdrop-blur-2xl shadow-2xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-bold">Select a token</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                    type="text"
                    placeholder={`Search name or symbol on ${network}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 p-3 pl-10 rounded-lg outline-none focus:ring-2 focus:ring-sui-blue"
                />
            </div>
        </div>

        <div className="overflow-y-auto flex-grow px-2 pb-2">
          <ul className="space-y-1">
            {filteredTokens.map((token) => (
              <li key={token.symbol}>
                <button
                  onClick={() => onSelect(token)}
                  className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-base-700/50 transition-colors text-left"
                >
                  <img
                    src={token.logo}
                    alt={`${token.name} logo`}
                    className="h-8 w-8 rounded-full bg-base-800"
                  />
                  <div>
                    <p className="font-semibold text-white">{token.symbol}</p>
                    <p className="text-sm text-gray-400">{token.name}</p>
                  </div>
                </button>
              </li>
            ))}
             {filteredTokens.length === 0 && (
                <li className="text-center text-gray-500 py-10">
                    No tokens found.
                </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TokenSelectionModal;