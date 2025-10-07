import React from 'react';

interface LoaderProps {
  message: string;
  progress?: number | null;
}

export const Loader: React.FC<LoaderProps> = ({ message, progress }) => {
  const percent = progress != null ? Math.round(progress * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center text-center w-full max-w-md">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500"></div>
      <p className="mt-6 text-xl font-semibold text-gray-300 tracking-wider">
        {message}
      </p>
      
      {progress != null && (
        <div className="w-full mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300 ease-linear" 
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-400">{percent}% complete</p>
        </div>
      )}
      
      <p className="mt-2 text-gray-500">This may take a moment...</p>
    </div>
  );
};