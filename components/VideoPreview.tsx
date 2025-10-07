import React from 'react';

interface VideoPreviewProps {
  videoSrc: string;
  onAnalyze: () => void;
  onCancel: () => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ videoSrc, onAnalyze, onCancel }) => {
  return (
    <div className="w-full max-w-3xl text-center animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-4">Ready to Analyze?</h2>
      <p className="text-gray-400 mb-6">Review your video below. If it's longer than 5 minutes, we'll analyze the final 5 minutes.</p>
      
      <div className="rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg mb-8 bg-black">
        <video 
          src={videoSrc} 
          controls 
          className="w-full max-h-[60vh] object-contain"
          aria-label="Video preview"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          Choose Different Video
        </button>
        <button
          onClick={onAnalyze}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          Analyze Gameplay
        </button>
      </div>
    </div>
  );
};