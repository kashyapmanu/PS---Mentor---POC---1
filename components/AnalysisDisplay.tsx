import React from 'react';
import type { AnalysisResult } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { UpTrendIcon } from './icons/UpTrendIcon';
import { BulbIcon } from './icons/BulbIcon';
import { RadarChartIcon } from './icons/RadarChartIcon';
import { RadarChart } from './RadarChart';

interface AnalysisDisplayProps {
  analysis: AnalysisResult;
  gameName: string;
  onReset: () => void;
  videoSrc: string;
}

interface AnalysisCardProps {
    title: string;
    items: string[];
    icon: React.ReactNode;
    colorClass: string;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ title, items, icon, colorClass }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/50 h-full">
        <div className={`flex items-center mb-4`}>
            <div className={`mr-3 p-2 rounded-full ${colorClass}`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-100">{title}</h3>
        </div>
        <ul className="space-y-3 pl-2">
            {items.map((item, index) => (
                <li key={index} className="flex items-start">
                    <svg className={`w-4 h-4 mr-3 mt-1 flex-shrink-0 ${colorClass.replace('bg','text')}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    <p className="text-gray-300">{item}</p>
                </li>
            ))}
        </ul>
    </div>
);

const SkillBreakdownCard: React.FC<{ ratings: { [key: string]: number } }> = ({ ratings }) => {
    const chartData = Object.keys(ratings).map(key => ({
        axis: key,
        value: ratings[key] / 10, // Normalize to 0-1 range
    }));
    
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/50 h-full">
            <div className="flex items-center mb-4">
                <div className="mr-3 p-2 rounded-full bg-purple-500/20 text-purple-400">
                    <RadarChartIcon />
                </div>
                <h3 className="text-xl font-bold text-gray-100">Skill Breakdown</h3>
            </div>
            <div className="flex justify-center items-center h-64">
                {chartData.length > 0 ? (
                    <RadarChart data={chartData} />
                ) : (
                    <p className="text-gray-400">No skill ratings available.</p>
                )}
            </div>
        </div>
    );
};

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, gameName, onReset, videoSrc }) => {
  const hasVideo = !!videoSrc;
  
  const gridTemplate = hasVideo 
    ? "grid-cols-1 lg:grid-cols-2"
    : "grid-cols-1 md:grid-cols-2";

  return (
    <div className="w-full animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white">Your Analysis for <span className="text-indigo-400">{gameName}</span></h2>
        <p className="text-gray-300 mt-2 max-w-3xl mx-auto italic">"{analysis.gameplaySummary}"</p>
      </div>

      <div className={hasVideo ? "grid grid-cols-1 lg:grid-cols-5 gap-8" : ""}>
        {hasVideo && (
          <div className="lg:col-span-2">
               <div className="rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg bg-black sticky top-8">
                  <video 
                      src={videoSrc} 
                      controls 
                      className="w-full h-auto object-contain"
                      aria-label="Your gameplay video"
                  />
              </div>
          </div>
        )}
        <div className={hasVideo ? "lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto"}>
            <div className="md:col-span-2">
                <SkillBreakdownCard ratings={analysis.skillRatings} />
            </div>
            <AnalysisCard title="Strengths" items={analysis.strengths} icon={<SparklesIcon />} colorClass="bg-green-500/20 text-green-400" />
            <AnalysisCard title="Areas for Improvement" items={analysis.improvements} icon={<UpTrendIcon />} colorClass="bg-yellow-500/20 text-yellow-400" />
            <div className="md:col-span-2">
                <AnalysisCard title="Actionable Tips" items={analysis.tips} icon={<BulbIcon />} colorClass="bg-blue-500/20 text-blue-400" />
            </div>
        </div>
      </div>


      <div className="text-center mt-12">
        <button
          onClick={onReset}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          Analyze Another Video
        </button>
      </div>
    </div>
  );
};
