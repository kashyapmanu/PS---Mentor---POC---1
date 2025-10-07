import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { Loader } from './components/Loader';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { VideoPreview } from './components/VideoPreview';
import { HistoryModal } from './components/HistoryModal';
import { InfographicsModal } from './components/InfographicsModal';
import { extractFramesFromVideo } from './utils/videoHelper';
import { identifyGame, analyzeGameplay } from './services/geminiService';
import type { AnalysisResult, AnalysisHistoryItem } from './types';

const App: React.FC = () => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [gameName, setGameName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState<number | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isInfographicsOpen, setIsInfographicsOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('psMentorHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
      setHistory([]);
    }
  }, []);

  const saveToHistory = (newAnalysis: AnalysisResult, newGameName: string) => {
    const newHistoryItem: AnalysisHistoryItem = {
      ...newAnalysis,
      id: crypto.randomUUID(),
      gameName: newGameName,
      date: new Date().toISOString(),
    };
    const updatedHistory = [newHistoryItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('psMentorHistory', JSON.stringify(updatedHistory));
  };

  const handleFileUpload = (file: File) => {
    setAnalysis(null);
    setGameName('');
    setError(null);
    setProgressMessage('');
    setProcessingProgress(null);
    setVideoFile(file);
    if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
    }
    setVideoSrc('');

    setIsLoading(true);
    setProgressMessage('Preparing video preview...');

    const video = document.createElement('video');
    video.preload = 'metadata';
    const tempUrl = URL.createObjectURL(file);
    video.src = tempUrl;

    video.onloadedmetadata = () => {
        URL.revokeObjectURL(tempUrl);
        const duration = video.duration;
        const MAX_DURATION = 300; // 5 mins
        let finalSrc = URL.createObjectURL(file);

        if (duration > MAX_DURATION) {
            const startTime = duration - MAX_DURATION;
            finalSrc += `#t=${startTime}`;
        }

        setVideoSrc(finalSrc);
        setIsLoading(false);
        setProgressMessage('');
    };

    video.onerror = () => {
        URL.revokeObjectURL(tempUrl);
        setError('Could not read video metadata. The file might be corrupt or an unsupported format.');
        setIsLoading(false);
        setProgressMessage('');
    };
  };

  const handleAnalysis = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setGameName('');
    setProcessingProgress(0);

    try {
      setProgressMessage('Extracting frames from video...');
      const frames = await extractFramesFromVideo(file, 8, (p) => setProcessingProgress(p));
      if (frames.length === 0) {
        throw new Error('Could not extract frames from the video. The file might be corrupted or in an unsupported format.');
      }
      
      setProcessingProgress(null);
      setProgressMessage('Identifying your game...');
      let identifiedGame = await identifyGame(frames[1]);
      if (identifiedGame.toLowerCase() === 'unknown') {
        identifiedGame = 'Unknown Game';
      }
      setGameName(identifiedGame);
      
      setProgressMessage(`Analyzing ${identifiedGame} gameplay...`);
      const analysisResult = await analyzeGameplay(frames, identifiedGame);
      setAnalysis(analysisResult);
      saveToHistory(analysisResult, identifiedGame);

    } catch (e: unknown) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during analysis.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setProgressMessage('');
      setProcessingProgress(null);
    }
  }, [history]);
  
  const handleReset = () => {
    setAnalysis(null);
    setGameName('');
    setIsLoading(false);
    setError(null);
    setProgressMessage('');
    setVideoFile(null);
    if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
    }
    setVideoSrc('');
    setProcessingProgress(null);
  };
  
  const handleViewHistoryItem = (item: AnalysisHistoryItem) => {
    setAnalysis({
      strengths: item.strengths,
      improvements: item.improvements,
      tips: item.tips,
      skillRatings: item.skillRatings,
      gameplaySummary: item.gameplaySummary,
    });
    setGameName(item.gameName);
    setVideoSrc(''); // No video for historical items
    setVideoFile(null);
    setIsHistoryOpen(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('psMentorHistory');
    setIsHistoryOpen(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loader message={progressMessage} progress={processingProgress} />;
    }
    if (error) {
      return (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Analysis Failed</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">{error}</p>
          <button
            onClick={handleReset}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      );
    }
    if (analysis) {
      return <AnalysisDisplay analysis={analysis} gameName={gameName} onReset={handleReset} videoSrc={videoSrc} />;
    }
    if (videoFile && videoSrc) {
      return <VideoPreview videoSrc={videoSrc} onAnalyze={() => handleAnalysis(videoFile)} onCancel={handleReset} />;
    }
    return <FileUpload onFileUpload={handleFileUpload} />;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <Header 
        onHistoryClick={() => setIsHistoryOpen(true)}
        onInfographicsClick={() => setIsInfographicsOpen(true)}
        hasHistory={history.length > 1}
      />
      <main className="w-full max-w-7xl flex-grow flex items-center justify-center">
        {renderContent()}
      </main>
      <HistoryModal 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onView={handleViewHistoryItem}
        onClear={handleClearHistory}
      />
      <InfographicsModal
        isOpen={isInfographicsOpen}
        onClose={() => setIsInfographicsOpen(false)}
        history={history}
      />
    </div>
  );
};

export default App;
