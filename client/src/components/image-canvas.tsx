import { useRef, useEffect, useState } from "react";
import { Detection, ImageDimensions } from "@/types/detection";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageCanvasProps {
  imageFile: File | null;
  detections: Detection[];
  onPredict: () => void;
  isProcessing: boolean;
}

const SENTIMENT_COLORS: Record<string, string> = {
  'happy': '#10B981',
  'neutral': '#F59E0B',
  'sad': '#EF4444',
  'angry': '#DC2626',
  'surprised': '#8B5CF6',
  'default': '#6366F1'
};

export function ImageCanvas({ imageFile, detections, onPredict, isProcessing }: ImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  const [displayDimensions, setDisplayDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });

  // Create object URL for the image file
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImageUrl(null);
    }
  }, [imageFile]);

  // Setup canvas when image loads
  const handleImageLoad = () => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    
    if (!image || !canvas) return;

    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;
    const displayWidth = image.offsetWidth;
    const displayHeight = image.offsetHeight;

    setImageDimensions({ width: naturalWidth, height: naturalHeight });
    setDisplayDimensions({ width: displayWidth, height: displayHeight });

    // Set canvas dimensions to match displayed image
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  };

  // Draw bounding boxes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !detections.length || !imageDimensions.width || !displayDimensions.width) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scale factors
    const scaleX = displayDimensions.width / imageDimensions.width;
    const scaleY = displayDimensions.height / imageDimensions.height;

    detections.forEach((detection) => {
      const color = SENTIMENT_COLORS[detection.class?.toLowerCase()] || SENTIMENT_COLORS.default;
      
      // Scale coordinates to match displayed image
      const x = detection.x * scaleX;
      const y = detection.y * scaleY;
      const width = detection.width * scaleX;
      const height = detection.height * scaleY;

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Draw label
      const label = `${detection.class} ${Math.round(detection.confidence * 100)}%`;
      ctx.font = '12px Inter, sans-serif';
      const labelWidth = ctx.measureText(label).width + 10;

      // Draw label background
      ctx.fillStyle = color;
      ctx.fillRect(x, y - 25, labelWidth, 20);

      // Draw label text
      ctx.fillStyle = 'white';
      ctx.fillText(label, x + 5, y - 10);
    });
  }, [detections, imageDimensions, displayDimensions]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current) {
        handleImageLoad();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const detectionsCount = detections.length;
  const hasDetections = detectionsCount > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Image Analysis</h3>
        <div className="flex items-center space-x-3">
          {isProcessing && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
              Analyzing...
            </span>
          )}
          <Button
            onClick={onPredict}
            disabled={!imageFile || isProcessing}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            Predict
          </Button>
        </div>
      </div>

      <div className="bg-slate-100 rounded-lg min-h-96 flex items-center justify-center border-2 border-dashed border-slate-300 relative">
        {!imageUrl ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No image uploaded</p>
            <p className="text-slate-400 text-sm">Upload an image to begin analysis</p>
          </div>
        ) : (
          <div className="relative inline-block">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Uploaded image"
              className="max-w-full h-auto rounded-lg shadow-lg"
              onLoad={handleImageLoad}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 pointer-events-none rounded-lg"
            />
          </div>
        )}
      </div>

      {hasDetections && (
        <div className="mt-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-slate-900">Detection Results</h4>
              <span className="text-sm text-slate-600">
                {detectionsCount} detection{detectionsCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(
                detections.reduce((acc, detection) => {
                  acc[detection.class] = (acc[detection.class] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([sentiment, count]) => (
                <div key={sentiment} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <div className="text-xs text-slate-600 capitalize">{sentiment}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
