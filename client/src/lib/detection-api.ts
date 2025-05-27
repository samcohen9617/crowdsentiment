import { DetectionResponse } from "@/types/detection";

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

  return await response.json();
}

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please select a JPG, PNG, or GIF image.'
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
