
import React from 'react';
import { Network, Feature } from '../../types';
import DashboardLayout from '../shared/DashboardLayout';
import MockSwap from '../shared/MockSwap';
import MockLiquidity from '../shared/MockLiquidity';
import MockMint from '../shared/MockMint';
import MockLaunchpad from '../shared/MockLaunchpad';

interface IotaDashboardProps {
  isConnected: boolean;
  address: string | null;
}

const IotaDashboard: React.FC<IotaDashboardProps> = ({ isConnected }) => {
  const network = Network.IOTA;
  const color = 'iota-green';

  const features = {
    [Feature.MINT]: <MockMint network={network} color={color} isConnected={isConnected} />,
    [Feature.LIQUIDITY]: <MockLiquidity network={network} color={color} isConnected={isConnected} />,
    [Feature.SWAP]: <MockSwap network={network} color={color} isConnected={isConnected} />,
    [Feature.LAUNCHPAD]: <MockLaunchpad network={network} color={color} />,
  };

  return <DashboardLayout network={network} features={features} color={color} />;
};

export default IotaDashboard;