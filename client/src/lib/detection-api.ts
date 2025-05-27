import { DetectionResponse, RoboflowResponse } from "@/types/detection";

export async function predictImage(imageFile: File): Promise<DetectionResponse> {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch('http://127.0.0.1:5000/crowdsentiment', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const roboflowData: RoboflowResponse = await response.json();
  
  // Transform combined results to our Detection format
  const detections = roboflowData.result.combined_result.map(result => {
    const crowdData = result.crowd_density;
    const facialData = result.facial_expression;
    
    // Get the facial expression with highest confidence, if any
    const topFacialExpression = facialData.predictions.length > 0 
      ? facialData.predictions.reduce((prev, current) => 
          prev.confidence > current.confidence ? prev : current
        )
      : null;
    
    return {
      class: crowdData.class.split(' - ')[0], // Remove the version info from class name
      confidence: crowdData.confidence,
      x: crowdData.x - (crowdData.width / 2), // Convert center-based to top-left coordinates
      y: crowdData.y - (crowdData.height / 2),
      width: crowdData.width,
      height: crowdData.height,
      mood: topFacialExpression?.class || undefined,
      moodConfidence: topFacialExpression?.confidence || undefined,
    };
  });

  return { detections };
}

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please select a JPG, PNG, GIF, or WebP image.'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File too large. Please select an image smaller than 10MB.'
    };
  }

  return { isValid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
