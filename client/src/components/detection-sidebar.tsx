import { Detection } from "@/types/detection";
import { Search, HelpCircle, Book, Settings } from "lucide-react";

interface DetectionSidebarProps {
  detections: Detection[];
}

const SENTIMENT_COLORS: Record<string, string> = {
  'happy': '#10B981',
  'neutral': '#F59E0B',
  'sad': '#EF4444',
  'angry': '#DC2626',
  'surprised': '#8B5CF6',
  'default': '#6366F1'
};

export function DetectionSidebar({ detections }: DetectionSidebarProps) {
  const hasDetections = detections.length > 0;

  // Calculate unique sentiments and their average confidence
  const sentimentStats = detections.reduce((acc, detection) => {
    const sentiment = detection.class;
    if (!acc[sentiment]) {
      acc[sentiment] = { count: 0, totalConfidence: 0 };
    }
    acc[sentiment].count += 1;
    acc[sentiment].totalConfidence += detection.confidence;
    return acc;
  }, {} as Record<string, { count: number; totalConfidence: number }>);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Detection Details</h3>
      
      {/* Legend */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Sentiment Categories</h4>
        <div className="space-y-2">
          {Object.entries(sentimentStats).map(([sentiment, stats]) => {
            const avgConfidence = Math.round((stats.totalConfidence / stats.count) * 100);
            const color = SENTIMENT_COLORS[sentiment.toLowerCase()] || SENTIMENT_COLORS.default;
            
            return (
              <div key={sentiment} className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-slate-700 capitalize">{sentiment}</span>
                <span className="text-xs text-slate-500 ml-auto">{avgConfidence}%</span>
              </div>
            );
          })}
          
          {!hasDetections && (
            <>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded bg-emerald-500" />
                <span className="text-sm text-slate-700">Happy</span>
                <span className="text-xs text-slate-500 ml-auto">--</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded bg-amber-500" />
                <span className="text-sm text-slate-700">Neutral</span>
                <span className="text-xs text-slate-500 ml-auto">--</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span className="text-sm text-slate-700">Sad</span>
                <span className="text-xs text-slate-500 ml-auto">--</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Individual Detections List */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3">Individual Detections</h4>
        
        {!hasDetections ? (
          <div className="text-center py-8">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No detections yet</p>
            <p className="text-slate-400 text-xs">Upload an image and click Predict</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {detections.map((detection, index) => {
              const color = SENTIMENT_COLORS[detection.class?.toLowerCase()] || SENTIMENT_COLORS.default;
              
              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm font-medium text-slate-900 capitalize">
                        {detection.class}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {Math.round(detection.confidence * 100)}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Box: ({Math.round(detection.x)}, {Math.round(detection.y)}) - ({Math.round(detection.x + detection.width)}, {Math.round(detection.y + detection.height)})
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* API Status */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <h4 className="text-sm font-medium text-slate-700 mb-3">API Status</h4>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Endpoint:</span>
          <span className="text-xs font-mono text-slate-500">127.0.0.1:5000</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-slate-600">Status:</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-xs text-emerald-600">Connected</span>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex justify-center space-x-6">
          <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors text-sm flex items-center">
            <HelpCircle className="w-4 h-4 mr-1" />
            Help
          </a>
          <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors text-sm flex items-center">
            <Book className="w-4 h-4 mr-1" />
            Docs
          </a>
          <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors text-sm flex items-center">
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </a>
        </div>
      </div>
    </div>
  );
}
