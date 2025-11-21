import React, { useState } from 'react';
import { Network, LaunchpadProject } from '../../types';
import ProjectAnalysisModal from './ProjectAnalysisModal';
import ProjectCard from '../../components/ProjectCard';

interface MockLaunchpadProps {
  network: Network;
  color: string;
}

const MOCK_PROJECTS: LaunchpadProject[] = [
  { id: 'proj1', name: 'Quantum Leap', description: 'A decentralized protocol for cross-chain atomic swaps using quantum-resistant cryptography, ensuring future-proof security for asset transfers.', logo: '⚛️', raised: 150000, goal: 500000, tokenSymbol: 'QNTM', status: 'Live' },
  { id: 'proj2', name: 'DeFi Garden', description: 'An automated yield farming aggregator that optimizes strategies across multiple liquidity pools to maximize returns for users with minimal effort.', logo: '🌱', raised: 750000, goal: 750000, tokenSymbol: 'GRDN', status: 'Ended' },
  { id: 'proj3', name: 'Nova Oracle', description: 'A high-speed, decentralized oracle network providing reliable real-world data to smart contracts, enabling complex dApps and financial instruments.', logo: '🔮', raised: 0, goal: 1000000, tokenSymbol: 'NOVA', status: 'Upcoming' },
];

const MockLaunchpad: React.FC<MockLaunchpadProps> = ({ network, color }) => {
    const [selectedProject, setSelectedProject] = useState<LaunchpadProject | null>(null);

    return (
        <>
            <div className="bg-base-800/40 border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl shadow-black/20 backdrop-blur-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <h2 className="text-xl font-bold text-center">Launchpad on {network}</h2>
                <div className="flex flex-col gap-4">
                    {MOCK_PROJECTS.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            color={color}
                            actionButton={
                                <button 
                                    onClick={() => setSelectedProject(project)}
                                    className={`w-full mt-2 bg-base-700 hover:bg-base-600 font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${project.status !== 'Live' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={project.status !== 'Live'}
                                >
                                    Participate
                                </button>
                            }
                        />
                    ))}
                </div>
            </div>
            {selectedProject && (
                <ProjectAnalysisModal 
                    project={selectedProject} 
                    onClose={() => setSelectedProject(null)} 
                    color={color}
                />
            )}
        </>
    );
};

export default MockLaunchpad;
