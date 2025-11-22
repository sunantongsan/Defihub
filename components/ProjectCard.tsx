import React from 'react';
import { LaunchpadProject } from '../types';

interface ProjectCardProps {
    project: LaunchpadProject;
    color: string;
    actionButton: React.ReactNode;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, color, actionButton }) => {
    const progress = (project.raised / project.goal) * 100;

    // FIX: Separated the object definition from the property access to resolve the type error.
    const statusTagClasses: { [key: string]: string } = {
        'sui-blue': 'bg-sui-blue/20 text-sui-blue',
        'iota-green': 'bg-iota-green/20 text-iota-green',
        'berachain-orange': 'bg-berachain-orange/20 text-berachain-orange',
    };
    const statusTagClass = statusTagClasses[color] || '';

    // FIX: Separated the object definition from the property access to resolve the type error.
    const progressBarClasses: { [key: string]: string } = {
        'sui-blue': 'bg-sui-blue',
        'iota-green': 'bg-iota-green',
        'berachain-orange': 'bg-berachain-orange',
    };
    const progressBarClass = progressBarClasses[color] || 'bg-gray-500';

    return (
        <div className="bg-base-800/40 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:border-white/20 shadow-2xl shadow-black/20 backdrop-blur-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-4">
                <img src={project.logo} alt={`${project.name} logo`} className="h-10 w-10 rounded-full object-cover bg-base-700" />
                <div>
                    <h3 className="font-bold text-lg text-gray-100">{project.name}</h3>
                    <p className="text-sm text-gray-400">${project.tokenSymbol}</p>
                </div>
                <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded-full ${project.status === 'Live' ? 'bg-green-500/20 text-green-400' : project.status === 'Ended' ? 'bg-gray-500/20 text-gray-400' : statusTagClass}`}>
                    {project.status}
                </span>
            </div>
            <p className="text-sm text-gray-300 h-10 flex-grow">{project.description.substring(0, 80)}...</p>
            <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden border border-white/5">
                    <div className={`${progressBarClass} h-2.5 rounded-full`} style={{ width: `${progress > 100 ? 100 : progress}%` }}></div>
                </div>
                 <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{project.raised.toLocaleString()} / {project.goal.toLocaleString()}</span>
                </div>
            </div>
            {actionButton}
        </div>
    );
};

export default ProjectCard;
