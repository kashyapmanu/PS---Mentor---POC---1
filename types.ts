export interface AnalysisResult {
  strengths: string[];
  improvements: string[];
  tips: string[];
  skillRatings: { [key: string]: number };
  gameplaySummary: string;
}

export interface AnalysisHistoryItem extends AnalysisResult {
  id: string;
  gameName: string;
  date: string;
}
