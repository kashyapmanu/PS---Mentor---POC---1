import React from 'react';
import type { AnalysisHistoryItem } from '../types';
import { LineChart } from './LineChart';

interface InfographicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: AnalysisHistoryItem[];
}

export const InfographicsModal: React.FC<InfographicsModalProps> = ({ isOpen, onClose, history }) => {
  if (!isOpen) return null;

  const reversedHistory = [...history].reverse(); // Oldest first for charting

  const skillNames = reversedHistory.length > 0 ? Object.keys(reversedHistory[0].skillRatings || {}) : [];
  
  const chartData = skillNames.map(skill => {
    return {
      id: skill,
      data: reversedHistory.map(item => ({
        x: new Date(item.date),
        y: item.skillRatings[skill] || 0
      }))
    };
  });

  const averageScores = skillNames.reduce((acc, skill) => {
    const total = reversedHistory.reduce((sum, item) => sum + (item.skillRatings[skill] || 0), 0);
    acc[skill] = (total / reversedHistory.length).toFixed(1);
    return acc;
  }, {} as { [key: string]: string });


  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="infographics-modal-title"
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col transform transition-transform duration-300 scale-95 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 id="infographics-modal-title" className="text-2xl font-bold text-white">Your Progress</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close infographics modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        
        <div className="p-6 overflow-y-auto flex-grow">
          {history.length > 1 ? (
            <>
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-200 mb-3">Overall Averages</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {Object.entries(averageScores).map(([skill, score]) => (
                        <div key={skill} className="bg-gray-700/50 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm">{skill}</p>
                            <p className="text-2xl font-bold text-indigo-400">{score}</p>
                        </div>
                    ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Skill Trends</h3>
                 <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <LineChart series={chartData} />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-10 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p className="text-gray-400">Not enough data to show progress.</p>
              <p className="text-sm text-gray-500 mt-2">Analyze at least two videos to see your skill trends over time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
