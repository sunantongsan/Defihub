import React, { useState, useCallback, useEffect } from 'react';
import { LaunchpadProject } from '../../types';
import { getGeminiAnalysis } from '../../services/geminiService';
import { LoadingSpinner, SparklesIcon } from '../../components/icons/InterfaceIcons';

interface ProjectAnalysisModalProps {
  project: LaunchpadProject;
  onClose: () => void;
  color: string;
}

const ProjectAnalysisModal: React.FC<ProjectAnalysisModalProps> = ({ project, onClose, color }) => {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getGeminiAnalysis(project);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to get analysis. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [project]);

  useEffect(() => {
    // Automatically fetch analysis when modal opens
    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);
  
  const formattedAnalysis = analysis.split('**').map((part, index) => 
    index % 2 === 1 ? <strong key={index} className={`font-bold text-${color}`}>{part}</strong> : part
  ).reduce((acc, curr, index) => {
      if(typeof curr === 'string') {
          return [...acc, ...curr.split('\n').map((line, i) => <p key={`${index}-${i}`}>{line}</p>)]
      }
      return [...acc, curr];
  }, [] as React.ReactNode[]);


  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-base-900/70 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col backdrop-blur-2xl shadow-2xl shadow-black/40" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
                <img src={project.logo} alt={`${project.name} logo`} className="h-10 w-10 rounded-full object-cover bg-base-700" />
                {project.name}
            </h2>
            <p className="text-gray-400 mt-1">{project.description}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-light">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <SparklesIcon className={`w-6 h-6 text-${color}`} />
            AI Project Analysis
          </h3>
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 text-gray-400 h-40">
                <LoadingSpinner className="w-10 h-10"/>
                <p>Generating analysis with Gemini...</p>
            </div>
          )}
          {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</p>}
          {!isLoading && analysis && (
            <div className="prose prose-invert text-gray-300 space-y-2 text-sm leading-relaxed">
                {formattedAnalysis}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-white/10 bg-black/20 rounded-b-2xl">
            <button 
                onClick={onClose} 
                className={`w-full bg-${color} text-black font-bold py-3 rounded-xl text-lg transition-all duration-300 transform hover:scale-[1.02] hover:opacity-90`}
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalysisModal;