export interface Detection {
  class: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  mood?: string;
  moodConfidence?: number;
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

export interface FacialExpressionPrediction {
  class: string;
  class_id: number;
  confidence: number;
  detection_id: string;
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface CombinedResult {
  crowd_density: {
    class: string;
    class_id: number;
    confidence: number;
    detection_id: string;
    height: number;
    width: number;
    x: number;
    y: number;
  };
  facial_expression: {
    image: {
      height: number;
      width: number;
    };
    inference_id: string;
    predictions: FacialExpressionPrediction[];
    time: number;
  };
}

export interface RoboflowResponse {
  message: string;
  result: {
    combined_result: CombinedResult[];
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
