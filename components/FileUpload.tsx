import React, { useState, useCallback, useRef } from 'react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setIsProcessing(true);
    // Use a short timeout to allow the UI to update to the processing state
    // before the main thread is blocked by URL.createObjectURL.
    setTimeout(() => {
      onFileUpload(file);
    }, 100);
  };

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, [onFileUpload]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     handleFile(e.target.files?.[0]);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (isProcessing) {
    return (
      <div className="w-full max-w-2xl p-8 sm:p-10 text-center border-2 border-dashed border-indigo-500 bg-gray-800 rounded-2xl">
        <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
            <p className="mt-4 text-xl font-semibold text-gray-300">Processing video...</p>
        </div>
      </div>
    );
  }

  const draggingClasses = isDragging ? 'border-indigo-500 bg-gray-800' : 'border-gray-600';

  return (
    <div 
      className={`w-full max-w-2xl p-8 sm:p-10 text-center border-2 border-dashed ${draggingClasses} rounded-2xl transition-all duration-300 transform hover:scale-105 hover:border-indigo-400 cursor-pointer`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
    >
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="video/*" 
        className="hidden" 
        onChange={handleChange}
        disabled={isProcessing}
      />
      <div className="flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-xl font-semibold text-gray-300">
          Drop your gameplay video here
        </p>
        <p className="text-gray-500 mt-1">or click to browse</p>
        <p className="text-xs text-gray-600 mt-4">Max 100MB, MP4/WEBM recommended</p>
      </div>
    </div>
  );
};