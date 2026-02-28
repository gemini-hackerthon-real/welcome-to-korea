// 카메라 프리셋 및 분석 결과 타입 정의

export type ViewType = "front" | "aerial" | "street" | "hill" | "panoramic" | "closeup";

export interface CameraPreset {
  id: string;
  place_id: string;
  view_type: ViewType;
  nameKo: string;
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  fov?: number;
  transitionDuration?: number;
}

export interface AnalysisResult {
  place_id: string;
  place_name: string;
  view_type: ViewType;
  landmarks: string[];
  confidence: number;
  camera_preset?: CameraPreset;
}
