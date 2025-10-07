import React from 'react';
import { HistoryIcon } from './icons/HistoryIcon';
import { ChartIcon } from './icons/ChartIcon';

interface HeaderProps {
  onHistoryClick: () => void;
  onInfographicsClick: () => void;
  hasHistory: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onHistoryClick, onInfographicsClick, hasHistory }) => {
  return (
    <header className="w-full max-w-7xl text-center mb-8 sm:mb-12 relative">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
        PS Mentor
      </h1>
      <p className="mt-2 text-lg text-gray-400">
        Your personal AI coach for mastering gameplay.
      </p>
      <div className="absolute top-0 right-0 flex items-center gap-2">
         <button 
            onClick={onInfographicsClick}
            className="p-2 text-gray-400 rounded-full transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent hover:text-white hover:bg-gray-700 relative group"
            aria-label="View progress infographics"
            disabled={!hasHistory}
        >
            <ChartIcon />
            {!hasHistory && (
                <span className="absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Analyze at least 2 videos to see progress
                </span>
            )}
        </button>
        <button 
            onClick={onHistoryClick}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors duration-300"
            aria-label="View analysis history"
        >
            <HistoryIcon />
        </button>
      </div>
    </header>
  );
};
