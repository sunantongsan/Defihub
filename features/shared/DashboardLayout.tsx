import React, { useState } from 'react';
import { Feature, Network } from '../../types';

interface DashboardLayoutProps {
  network: Network;
  features: {
    [key in Feature]: React.ReactNode;
  };
  color: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ network, features, color }) => {
  const [activeFeature, setActiveFeature] = useState<Feature>(Feature.SWAP);
  const featureList = Object.values(Feature);

  const activeFeatureButtonStyles: { [key: string]: string } = {
    'sui-blue': 'bg-sui-blue text-black shadow-lg shadow-sui-blue/30',
    'iota-green': 'bg-iota-green text-black shadow-lg shadow-iota-green/30',
    'berachain-orange': 'bg-berachain-orange text-black shadow-lg shadow-berachain-orange/30',
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-base-900/50 border border-white/10 rounded-full p-1.5 self-center backdrop-blur-lg">
        <div className="flex items-center gap-2">
          {featureList.map((feature) => (
            <button
              key={feature}
              onClick={() => setActiveFeature(feature)}
              className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ${
                activeFeature === feature
                  ? activeFeatureButtonStyles[color]
                  : 'text-gray-300 hover:bg-base-700/50'
              }`}
            >
              {feature}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full max-w-lg mx-auto">
        {features[activeFeature]}
      </div>
    </div>
  );
};

export default DashboardLayout;