import React from 'react';
import { Network, Feature } from '../../types';
import DashboardLayout from '../shared/DashboardLayout';
import Swap from '../shared/Swap';
import MockLiquidity from '../shared/MockLiquidity';
import MockMint from '../shared/MockMint';
import MockLaunchpad from '../shared/MockLaunchpad';

interface EvmDashboardProps {
  isConnected: boolean;
  address: string | null;
}

const EvmDashboard: React.FC<EvmDashboardProps> = ({ isConnected, address }) => {
  const network = Network.EVM;
  const color = 'berachain-orange'; // Keep the theme color

  const features = {
    [Feature.MINT]: <MockMint network={network} color={color} isConnected={isConnected} />,
    [Feature.LIQUIDITY]: <MockLiquidity network={network} color={color} isConnected={isConnected} />,
    [Feature.SWAP]: <Swap network={network} color={color} isConnected={isConnected} address={address} />,
    [Feature.LAUNCHPAD]: <MockLaunchpad network={network} color={color} />,
  };

  return <DashboardLayout network={network} features={features} color={color} />;
};

export default EvmDashboard;
