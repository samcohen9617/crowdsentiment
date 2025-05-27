import { useState, useRef, useCallback } from "react";
import { CloudUpload, FolderOpen, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateImageFile, formatFileSize } from "@/lib/detection-api";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileUpload({ onFileSelect, disabled = false }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback((file: File) => {
    const validation = validateImageFile(file);
    
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: validation.error,
      });
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  }, [onFileSelect, toast]);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    // Only remove drag state if we're actually leaving the drop zone
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Upload Image for Analysis</h2>
        <p className="text-slate-600 text-sm">Upload an image to detect crowd sentiment. Supported formats: JPG, PNG, GIF</p>
      </div>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : disabled 
              ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
              : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-slate-100'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <CloudUpload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-slate-700 mb-2">Drag and drop your image here</p>
        <p className="text-slate-500 mb-4">or</p>
        <Button 
          variant="default" 
          className="bg-blue-500 hover:bg-blue-600"
          disabled={disabled}
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Choose File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {selectedFile && (
        <div className="mt-4">
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-700">{selectedFile.name}</span>
            <span className="text-slate-500">{formatFileSize(selectedFile.size)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
