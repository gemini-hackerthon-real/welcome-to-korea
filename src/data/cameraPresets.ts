// 카메라 프리셋 데이터
// 각 관광지별 다양한 뷰 타입에 대한 카메라 위치/타겟 정의

import { CameraPreset } from "@/types/camera";

export const CAMERA_PRESETS: CameraPreset[] = [
  // === 경복궁 ===
  {
    id: "gyeongbokgung-front",
    place_id: "gyeongbokgung",
    view_type: "front",
    nameKo: "근정전 정면",
    position: { x: 0, y: 15, z: 45 },
    target: { x: 0, y: 5, z: 0 },
    fov: 50,
    transitionDuration: 2000,
  },
  {
    id: "gyeongbokgung-aerial",
    place_id: "gyeongbokgung",
    view_type: "aerial",
    nameKo: "경복궁 조감도",
    position: { x: 30, y: 80, z: 60 },
    target: { x: 0, y: 0, z: -10 },
    fov: 55,
    transitionDuration: 2500,
  },
  {
    id: "gyeongbokgung-street",
    place_id: "gyeongbokgung",
    view_type: "street",
    nameKo: "광화문 앞",
    position: { x: 0, y: 8, z: 70 },
    target: { x: 0, y: 8, z: 0 },
    fov: 45,
    transitionDuration: 2000,
  },

  // === 홍대 ===
  {
    id: "hongdae-street",
    place_id: "hongdae",
    view_type: "street",
    nameKo: "홍대 메인스트리트",
    position: { x: -5, y: 12, z: 50 },
    target: { x: 0, y: 5, z: 0 },
    fov: 55,
    transitionDuration: 2000,
  },
  {
    id: "hongdae-front",
    place_id: "hongdae",
    view_type: "front",
    nameKo: "버스킹존 정면",
    position: { x: -8, y: 8, z: 20 },
    target: { x: -8, y: 2, z: -5 },
    fov: 50,
    transitionDuration: 1800,
  },
  {
    id: "hongdae-panoramic",
    place_id: "hongdae",
    view_type: "panoramic",
    nameKo: "홍대 전경",
    position: { x: 40, y: 60, z: 40 },
    target: { x: 0, y: 0, z: 0 },
    fov: 60,
    transitionDuration: 2500,
  },

  // === 이태원 ===
  {
    id: "itaewon-hill",
    place_id: "itaewon",
    view_type: "hill",
    nameKo: "이태원로 언덕",
    position: { x: 15, y: 25, z: 50 },
    target: { x: 0, y: 8, z: 0 },
    fov: 50,
    transitionDuration: 2000,
  },
  {
    id: "itaewon-street",
    place_id: "itaewon",
    view_type: "street",
    nameKo: "네온거리",
    position: { x: 0, y: 10, z: 35 },
    target: { x: 0, y: 8, z: 0 },
    fov: 55,
    transitionDuration: 1800,
  },
  {
    id: "itaewon-aerial",
    place_id: "itaewon",
    view_type: "aerial",
    nameKo: "이태원 야경 조감",
    position: { x: 25, y: 70, z: 50 },
    target: { x: 0, y: 0, z: -5 },
    fov: 55,
    transitionDuration: 2500,
  },

  // === 강남 ===
  {
    id: "gangnam-street",
    place_id: "gangnam",
    view_type: "street",
    nameKo: "테헤란로",
    position: { x: 0, y: 15, z: 60 },
    target: { x: 0, y: 20, z: 0 },
    fov: 50,
    transitionDuration: 2000,
  },
  {
    id: "gangnam-aerial",
    place_id: "gangnam",
    view_type: "aerial",
    nameKo: "강남 스카이라인",
    position: { x: 40, y: 100, z: 60 },
    target: { x: 0, y: 30, z: 0 },
    fov: 55,
    transitionDuration: 2500,
  },
  {
    id: "gangnam-front",
    place_id: "gangnam",
    view_type: "front",
    nameKo: "강남역 정면",
    position: { x: 0, y: 10, z: 40 },
    target: { x: 0, y: 5, z: 0 },
    fov: 50,
    transitionDuration: 2000,
  },
];

// place_id로 프리셋 찾기
export function getPresetsByPlaceId(placeId: string): CameraPreset[] {
  return CAMERA_PRESETS.filter((preset) => preset.place_id === placeId);
}

// place_id + view_type으로 프리셋 찾기
export function getPreset(placeId: string, viewType: string): CameraPreset | undefined {
  return CAMERA_PRESETS.find(
    (preset) => preset.place_id === placeId && preset.view_type === viewType
  );
}

// 프리셋 ID로 찾기
export function getPresetById(id: string): CameraPreset | undefined {
  return CAMERA_PRESETS.find((preset) => preset.id === id);
}

// 지원하는 장소 목록
export const SUPPORTED_PLACES = [
  { id: "gyeongbokgung", nameKo: "경복궁", nameEn: "Gyeongbokgung Palace" },
  { id: "hongdae", nameKo: "홍대", nameEn: "Hongdae" },
  { id: "itaewon", nameKo: "이태원", nameEn: "Itaewon" },
  { id: "gangnam", nameKo: "강남", nameEn: "Gangnam" },
];
