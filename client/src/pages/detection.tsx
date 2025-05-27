import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { FileUpload } from "@/components/file-upload";
import { ImageCanvas } from "@/components/image-canvas";
import { DetectionSidebar } from "@/components/detection-sidebar";
import { Detection } from "@/types/detection";
import { predictImage } from "@/lib/detection-api";
import { useToast } from "@/hooks/use-toast";

export default function DetectionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const { toast } = useToast();

  const predictionMutation = useMutation({
    mutationFn: predictImage,
    onSuccess: (data) => {
      setDetections(data.detections || []);
      toast({
        title: "Analysis complete",
        description: `Found ${data.detections?.length || 0} detections`,
      });
    },
    onError: (error) => {
      console.error('Prediction error:', error);
      toast({
        variant: "destructive",
        title: "Prediction failed",
        description: "Unable to connect to the API. Please check if the server is running.",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Clear previous detections when new file is selected
    setDetections([]);
  };

  const handlePredict = () => {
    if (selectedFile) {
      predictionMutation.mutate(selectedFile);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="mb-8">
          <FileUpload 
            onFileSelect={handleFileSelect}
            disabled={predictionMutation.isPending}
          />
        </div>

        {/* Image Display and Detection Results */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Image Preview and Canvas */}
          <div className="lg:col-span-2">
            <ImageCanvas
              imageFile={selectedFile}
              detections={detections}
              onPredict={handlePredict}
              isProcessing={predictionMutation.isPending}
            />
          </div>

          {/* Detection Details Sidebar */}
          <div className="lg:col-span-1">
            <DetectionSidebar detections={detections} imageFile={selectedFile} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-slate-600 text-sm">Computer Vision Detection App - Built with Roboflow API</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
