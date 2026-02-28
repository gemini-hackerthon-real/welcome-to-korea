// 마스코트 관련 타입 정의

import { MascotVariantId } from "./district";

export type HeadAccessory =
  | "none"
  | "hanbok_gat"      // 경복궁 - 갓
  | "dj_headphones"   // 이태원 - 헤드폰
  | "beret"           // 홍대 - 베레모
  | "sunglasses";     // 강남 - 선글라스

export type BodyOutfit =
  | "default"
  | "hanbok"          // 경복궁 - 한복
  | "streetwear"      // 이태원 - 스트릿웨어
  | "artist_apron"    // 홍대 - 앞치마
  | "business_suit";  // 강남 - 정장

export type HandAccessory =
  | "none"
  | "fan"             // 경복궁 - 부채
  | "glow_stick"      // 이태원 - 야광봉
  | "spray_can"       // 홍대 - 스프레이
  | "coffee_cup";     // 강남 - 커피컵

export type MascotAnimation =
  | "idle"
  | "walk"
  | "bow"             // 경복궁 - 인사
  | "dance"           // 이태원 - 춤
  | "paint"           // 홍대 - 그리기
  | "phone_call";     // 강남 - 전화

export type MascotMood =
  | "neutral"
  | "happy"
  | "excited"
  | "calm"
  | "focused";

export interface MascotOutfit {
  head: HeadAccessory;
  body: BodyOutfit;
  hand: HandAccessory;
}

export interface MascotVariant {
  id: MascotVariantId;
  districtId: string;
  outfit: MascotOutfit;
  defaultAnimation: MascotAnimation;
  mood: MascotMood;
  colorTint?: string; // 색조 변화
}

export interface MascotState {
  currentVariant: MascotVariant;
  currentAnimation: MascotAnimation;
  position: { x: number; y: number; z: number };
  rotation: number;
  isTransitioning: boolean;
}

// 마스코트 variant 프리셋
export const MASCOT_VARIANTS: Record<MascotVariantId, MascotVariant> = {
  gyeongbokgung_hanbok: {
    id: "gyeongbokgung_hanbok",
    districtId: "gyeongbokgung",
    outfit: {
      head: "hanbok_gat",
      body: "hanbok",
      hand: "fan",
    },
    defaultAnimation: "bow",
    mood: "calm",
    colorTint: "#8B4513",
  },
  itaewon_dj: {
    id: "itaewon_dj",
    districtId: "itaewon",
    outfit: {
      head: "dj_headphones",
      body: "streetwear",
      hand: "glow_stick",
    },
    defaultAnimation: "dance",
    mood: "excited",
    colorTint: "#FF1493",
  },
  hongdae_artist: {
    id: "hongdae_artist",
    districtId: "hongdae",
    outfit: {
      head: "beret",
      body: "artist_apron",
      hand: "spray_can",
    },
    defaultAnimation: "paint",
    mood: "focused",
    colorTint: "#9370DB",
  },
  gangnam_business: {
    id: "gangnam_business",
    districtId: "gangnam",
    outfit: {
      head: "sunglasses",
      body: "business_suit",
      hand: "coffee_cup",
    },
    defaultAnimation: "phone_call",
    mood: "focused",
    colorTint: "#4169E1",
  },
};
