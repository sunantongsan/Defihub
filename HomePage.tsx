import React from 'react';
import { Network, LaunchpadProject } from './types';
import ProjectCard from './components/ProjectCard';
import { SuiLogo, IotaLogo, BerachainLogo } from './components/icons/ChainLogos';

interface HomePageProps {
  onNavigateToDashboard: (network: Network) => void;
}

const MOCK_PROJECTS_BY_NETWORK: { [key in Network]?: LaunchpadProject[] } = {
  [Network.SUI]: [
    { id: 'sui1', name: 'Aqua Protocol', description: 'A decentralized liquid staking protocol on Sui, allowing users to earn staking rewards while maintaining liquidity for their assets.', logo: 'https://cdn-icons-png.flaticon.com/512/599/599502.png', raised: 250000, goal: 600000, tokenSymbol: 'AQUA', status: 'Live' },
    { id: 'sui2', name: 'Sui Scape', description: 'A metaverse project building a persistent virtual world on the Sui blockchain, focused on gaming and social experiences.', logo: 'https://cdn-icons-png.flaticon.com/512/3069/3069243.png', raised: 120000, goal: 1000000, tokenSymbol: 'SCAPE', status: 'Upcoming' },
  ],
  [Network.IOTA]: [
    { id: 'iota1', name: 'Tangle Swap', description: 'A next-generation DEX built on the IOTA Tangle, offering feeless trades and parallel transaction processing.', logo: 'https://cdn-icons-png.flaticon.com/512/3997/3997705.png', raised: 450000, goal: 1000000, tokenSymbol: 'TNG', status: 'Live' },
    { id: 'iota2', name: 'Feeless NFT', description: 'A marketplace for creating and trading NFTs on IOTA with zero minting fees and instant settlement.', logo: 'https://cdn-icons-png.flaticon.com/512/8133/8133722.png', raised: 90000, goal: 250000, tokenSymbol: 'FNFT', status: 'Upcoming' },
  ],
  [Network.EVM]: [
    { id: 'bera1', name: 'Honey Pot Finance', description: 'A gamified yield farming protocol on Berachain, where users can stake assets in "Honey Pots" to earn multiple token rewards.', logo: 'https://cdn-icons-png.flaticon.com/512/2307/2307328.png', raised: 80000, goal: 400000, tokenSymbol: 'POT', status: 'Live' },
    { id: 'bera2', name: 'Cuboard Finance', description: 'A decentralized perpetuals exchange on Berachain offering leverage trading with low slippage and deep liquidity.', logo: 'https://cdn-icons-png.flaticon.com/512/3069/3069170.png', raised: 0, goal: 750000, tokenSymbol: 'CUB', status: 'Upcoming' },
  ],
};

const networkDisplayConfig = {
    [Network.SUI]: { logo: <SuiLogo className="h-8 w-8" />, color: 'sui-blue', name: 'Sui' },
    [Network.IOTA]: { logo: <IotaLogo className="h-8 w-8" />, color: 'iota-green', name: 'IOTA' },
    [Network.EVM]: { logo: <BerachainLogo className="h-8 w-8" />, color: 'berachain-orange', name: 'EVM / Web3' }
};

const HomePage: React.FC<HomePageProps> = ({ onNavigateToDashboard }) => {
  const headerBgClass: { [key: string]: string } = {
    'sui-blue': 'bg-sui-blue',
    'iota-green': 'bg-iota-green',
    'berachain-orange': 'bg-berachain-orange',
  };
  const actionButtonClass: { [key: string]: string } = {
    'sui-blue': 'bg-sui-blue/20 hover:bg-sui-blue/30 text-sui-blue',
    'iota-green': 'bg-iota-green/20 hover:bg-iota-green/30 text-iota-green',
    'berachain-orange': 'bg-berachain-orange/20 hover:bg-berachain-orange/30 text-berachain-orange',
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">Featured Launchpad Projects</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">Discover the next wave of innovation across the multi-chain ecosystem. Invest in projects before they launch.</p>
      </div>

      <div className="space-y-16">
        {(Object.keys(networkDisplayConfig) as Network[]).map((network) => (
          <section key={network} aria-labelledby={`${network}-heading`}>
            <div className="relative pl-6 mb-8">
               <div className={`absolute left-0 top-0 h-full w-1 ${headerBgClass[networkDisplayConfig[network].color]} rounded-full`}></div>
               <div className={`absolute left-0 top-0 h-full w-1 ${headerBgClass[networkDisplayConfig[network].color]} rounded-full blur-md`}></div>

              {/* FIX: Corrected variable name from networkDisplay to networkDisplayConfig and completed the component structure. */}
              <div className="flex items-center gap-4">
                {networkDisplayConfig[network].logo}
                <h2 id={`${network}-heading`} className="text-2xl font-bold">{networkDisplayConfig[network].name}</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(MOCK_PROJECTS_BY_NETWORK[network] || []).map(project => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        color={networkDisplayConfig[network].color}
                        actionButton={
                            <button 
                                onClick={() => onNavigateToDashboard(network)}
                                className={`w-full mt-2 font-semibold py-2 rounded-lg transition-colors ${actionButtonClass[networkDisplayConfig[network].color]}`}
                            >
                                Explore on {networkDisplayConfig[network].name}
                            </button>
                        }
                    />
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

// FIX: Module has no default export. Added default export for HomePage component.
export default HomePage;