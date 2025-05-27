export interface Detection {
  class: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoboflowPrediction {
  class: string;
  class_id: number;
  confidence: number;
  detection_id: string;
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface RoboflowResponse {
  message: string;
  result: {
    image: {
      height: number;
      width: number;
    };
    inference_id: string;
    predictions: RoboflowPrediction[];
  };
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
