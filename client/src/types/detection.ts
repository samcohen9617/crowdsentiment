export interface Detection {
  class: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectionResponse {
  detections: Detection[];
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface DetectionStats {
  [key: string]: number;
}
