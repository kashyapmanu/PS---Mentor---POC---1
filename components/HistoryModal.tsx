import React from 'react';
import type { AnalysisHistoryItem } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: AnalysisHistoryItem[];
  onView: (item: AnalysisHistoryItem) => void;
  onClear: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onView, onClear }) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col transform transition-transform duration-300 scale-95 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 id="history-modal-title" className="text-2xl font-bold text-white">Analysis History</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close history modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        
        <div className="p-2 overflow-y-auto flex-grow">
          {history.length > 0 ? (
            <ul className="divide-y divide-gray-700/50">
              {history.map(item => (
                <li key={item.id}>
                  <button onClick={() => onView(item)} className="w-full text-left p-4 hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
                    <p className="font-semibold text-indigo-400">{item.gameName}</p>
                    <p className="text-sm text-gray-400">{formatDate(item.date)}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center p-10">
              <p className="text-gray-400">No analysis history found.</p>
              <p className="text-sm text-gray-500 mt-2">Complete your first analysis to see it here!</p>
            </div>
          )}
        </div>

        {history.length > 0 && (
          <footer className="p-4 border-t border-gray-700 text-right">
            <button 
              onClick={onClear} 
              className="flex items-center gap-2 justify-center ml-auto text-sm bg-red-800/50 text-red-300 hover:bg-red-800/80 hover:text-red-200 font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              <TrashIcon />
              Clear History
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};
