import React from 'react';
import { Network, Feature } from '../../types';
import DashboardLayout from '../shared/DashboardLayout';
import Swap from '../shared/Swap';
import MockLiquidity from '../shared/MockLiquidity';
import Mint from './Mint'; 
import MockLaunchpad from '../shared/MockLaunchpad';

interface SuiDashboardProps {
  isConnected: boolean;
  address: string | null;
}

const SuiDashboard: React.FC<SuiDashboardProps> = ({ isConnected, address }) => {
  const network = Network.SUI;
  const color = 'sui-blue';
  
  const features = {
    [Feature.MINT]: <Mint network={network} color={color} isConnected={isConnected} address={address} />,
    [Feature.LIQUIDITY]: <MockLiquidity network={network} color={color} isConnected={isConnected} />,
    [Feature.SWAP]: <Swap network={network} color={color} isConnected={isConnected} address={address} />,
    [Feature.LAUNCHPAD]: <MockLaunchpad network={network} color={color} />,
  };
  
  return <DashboardLayout network={network} features={features} color={color} />;
};

export default SuiDashboard;
