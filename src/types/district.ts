// 지역 (District) 관련 타입 정의

export type DistrictStyle = "traditional" | "modern" | "artistic" | "nightlife";

export interface DistrictTheme {
  style: DistrictStyle;
  colorPalette: string[];
  architectureStyle: string;
  ambiance: string; // 분위기 설명
}

export interface DistrictBounds {
  center: { lat: number; lng: number };
  radius: number; // km 단위
}

export interface AudioConfig {
  bgm: string; // 오디오 파일 경로
  volume: number;
  loop: boolean;
  ambientSounds?: string[]; // 환경음
}

export interface District {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  bounds: DistrictBounds;
  theme: DistrictTheme;
  audio: AudioConfig;
  pois: POI[];
  mascotVariant: MascotVariantId;
}

// POI (Point of Interest) 타입
export type POIType = "landmark" | "shop" | "restaurant" | "street_art" | "entertainment";

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface POI {
  id: string;
  name: string;
  nameKo: string;
  type: POIType;
  position: Position3D;
  description?: string;
  interactions: Interaction[];
  modelPath?: string; // 3D 모델 경로
  texturePath?: string; // 텍스처 경로
}

// 인터랙션 타입
export type InteractionTrigger = "proximity" | "click" | "time";
export type InteractionAction = "play_audio" | "show_info" | "animate" | "gemini_narrate" | "change_mood";

export interface Interaction {
  id: string;
  trigger: InteractionTrigger;
  action: InteractionAction;
  config: InteractionConfig;
}

export interface InteractionConfig {
  // 거리 기반 트리거
  proximityRadius?: number;
  // 시간 기반 트리거
  timeCondition?: {
    startHour: number;
    endHour: number;
  };
  // 액션 설정
  audioFile?: string;
  animationName?: string;
  geminiPrompt?: string;
  infoContent?: {
    title: string;
    description: string;
    imageUrl?: string;
  };
}

// 마스코트 variant ID
export type MascotVariantId =
  | "gyeongbokgung_hanbok"
  | "itaewon_dj"
  | "hongdae_artist"
  | "gangnam_business";
