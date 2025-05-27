import { Detection } from "@/types/detection";
import { Search, HelpCircle, Book, Settings } from "lucide-react";
import { useRef, useEffect, useState } from "react";

interface DetectionSidebarProps {
  detections: Detection[];
  imageFile: File | null;
}

const MOOD_COLORS: Record<string, string> = {
  'happy': '#10B981',
  'neutral': '#F59E0B', 
  'sad': '#3B82F6',
  'angry': '#DC2626',
  'surprised': '#8B5CF6',
  'fear': '#F97316',
  'disgust': '#84CC16',
  'default': '#6366F1'
};

const MOOD_EMOJIS: Record<string, string> = {
  'happy': '😊',
  'neutral': '😐',
  'sad': '😢',
  'angry': '😠',
  'surprised': '😲',
  'fear': '😨',
  'disgust': '🤢',
  'default': '👤'
};

export function DetectionSidebar({ detections, imageFile }: DetectionSidebarProps) {
  const hasDetections = detections.length > 0;
  const [croppedImages, setCroppedImages] = useState<{ [key: number]: string }>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Create cropped images for each detection
  useEffect(() => {
    if (!imageFile || !hasDetections) {
      setCroppedImages({});
      return;
    }

    const createCroppedImages = async () => {
      const img = new Image();
      const imageUrl = URL.createObjectURL(imageFile);
      
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const newCroppedImages: { [key: number]: string } = {};

        detections.forEach((detection, index) => {
          // Set canvas size to the detection box size
          canvas.width = detection.width;
          canvas.height = detection.height;

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw the cropped section of the image
          ctx.drawImage(
            img,
            detection.x, detection.y, detection.width, detection.height, // Source rectangle
            0, 0, detection.width, detection.height // Destination rectangle
          );

          // Convert to data URL
          newCroppedImages[index] = canvas.toDataURL('image/jpeg', 0.8);
        });

        setCroppedImages(newCroppedImages);
        URL.revokeObjectURL(imageUrl);
      };

      img.src = imageUrl;
    };

    createCroppedImages();
  }, [detections, imageFile, hasDetections]);

  // Calculate unique moods and their average confidence
  const moodStats = detections.reduce((acc, detection) => {
    const mood = detection.mood || 'unknown';
    if (!acc[mood]) {
      acc[mood] = { count: 0, totalConfidence: 0 };
    }
    acc[mood].count += 1;
    acc[mood].totalConfidence += (detection.moodConfidence || 0);
    return acc;
  }, {} as Record<string, { count: number; totalConfidence: number }>);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Hidden canvas for image cropping */}
      <canvas ref={canvasRef} className="hidden" />
      
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Detection Details</h3>
      
      {/* Mood Legend */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Detected Moods</h4>
        <div className="space-y-2">
          {Object.entries(moodStats).map(([mood, stats]) => {
            const avgConfidence = stats.count > 0 ? Math.round((stats.totalConfidence / stats.count) * 100) : 0;
            const color = MOOD_COLORS[mood.toLowerCase()] || MOOD_COLORS.default;
            const emoji = MOOD_EMOJIS[mood.toLowerCase()] || MOOD_EMOJIS.default;
            
            return (
              <div key={mood} className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded flex items-center justify-center text-xs" 
                  style={{ backgroundColor: color }}
                >
                  {emoji}
                </div>
                <span className="text-sm text-slate-700 capitalize">{mood}</span>
                <span className="text-xs text-slate-500 ml-auto">
                  {avgConfidence > 0 ? `${avgConfidence}%` : '--'}
                </span>
              </div>
            );
          })}
          
          {!hasDetections && (
            <>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center text-xs">😊</div>
                <span className="text-sm text-slate-700">Happy</span>
                <span className="text-xs text-slate-500 ml-auto">--</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded bg-red-600 flex items-center justify-center text-xs">😠</div>
                <span className="text-sm text-slate-700">Angry</span>
                <span className="text-xs text-slate-500 ml-auto">--</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded bg-amber-500 flex items-center justify-center text-xs">😐</div>
                <span className="text-sm text-slate-700">Neutral</span>
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
          <div className="space-y-3 max-h-96 overflow-y-auto detection-list">
            {detections.map((detection, index) => {
              const mood = detection.mood || 'unknown';
              const color = MOOD_COLORS[mood.toLowerCase()] || MOOD_COLORS.default;
              const emoji = MOOD_EMOJIS[mood.toLowerCase()] || MOOD_EMOJIS.default;
              const croppedImage = croppedImages[index];
              
              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    {/* Cropped image thumbnail */}
                    <div className="flex-shrink-0 relative">
                      {croppedImage ? (
                        <div className="relative">
                          <img
                            src={croppedImage}
                            alt={`Detected person`}
                            className="w-16 h-16 object-cover rounded-md border border-slate-200"
                          />
                          {/* Mood overlay */}
                          {detection.mood && (
                            <div 
                              className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-sm border-2 border-white shadow-sm"
                              style={{ backgroundColor: color }}
                              title={`${mood} (${Math.round((detection.moodConfidence || 0) * 100)}%)`}
                            >
                              {emoji}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                    
                    {/* Detection info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-slate-900">
                            Person #{index + 1}
                          </span>
                          {detection.mood && (
                            <span className="text-xs px-2 py-1 rounded-full text-white font-medium" style={{ backgroundColor: color }}>
                              {mood}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          {Math.round(detection.confidence * 100)}%
                        </span>
                      </div>
                      
                      {/* Mood confidence */}
                      {detection.mood && detection.moodConfidence && (
                        <div className="text-xs text-slate-600 mt-1">
                          Mood confidence: {Math.round(detection.moodConfidence * 100)}%
                        </div>
                      )}
                      
                      <div className="text-xs text-slate-600 mt-1">
                        Size: {Math.round(detection.width)}×{Math.round(detection.height)}px
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Position: ({Math.round(detection.x)}, {Math.round(detection.y)})
                      </div>
                    </div>
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
