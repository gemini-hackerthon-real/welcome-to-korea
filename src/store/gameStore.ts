// Zustand 기반 전역 상태 관리

import { create } from "zustand";
import { District, POI, MascotState, MascotVariant, MASCOT_VARIANTS } from "@/types";
import { DISTRICTS, getDistrictById } from "@/data/districts";

interface GameState {
  // 현재 지역
  currentDistrict: District | null;
  previousDistrict: District | null;

  // 마스코트 상태
  mascot: MascotState;

  // 플레이어 위치
  playerPosition: { x: number; y: number; z: number };

  // UI 상태
  selectedPOI: POI | null;
  isInfoPanelOpen: boolean;
  isChatOpen: boolean;

  // 오디오 상태
  isMuted: boolean;
  masterVolume: number;

  // 로딩 상태
  isLoading: boolean;
  loadingMessage: string;

  // 액션
  setCurrentDistrict: (districtId: string) => void;
  updatePlayerPosition: (x: number, y: number, z: number) => void;
  selectPOI: (poi: POI | null) => void;
  toggleInfoPanel: (open?: boolean) => void;
  toggleChat: (open?: boolean) => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  setLoading: (loading: boolean, message?: string) => void;
  transitionMascot: (variantId: string) => void;
}

const DEFAULT_MASCOT_STATE: MascotState = {
  currentVariant: MASCOT_VARIANTS.gyeongbokgung_hanbok,
  currentAnimation: "idle",
  position: { x: 0, y: 0, z: 0 },
  rotation: 0,
  isTransitioning: false,
};

export const useGameStore = create<GameState>((set, get) => ({
  // 초기 상태
  currentDistrict: DISTRICTS[0], // 경복궁으로 시작
  previousDistrict: null,
  mascot: DEFAULT_MASCOT_STATE,
  playerPosition: { x: 0, y: 0, z: 0 },
  selectedPOI: null,
  isInfoPanelOpen: false,
  isChatOpen: false,
  isMuted: false,
  masterVolume: 0.7,
  isLoading: false,
  loadingMessage: "",

  // 지역 변경
  setCurrentDistrict: (districtId: string) => {
    const district = getDistrictById(districtId);
    if (!district) return;

    const current = get().currentDistrict;

    set({
      previousDistrict: current,
      currentDistrict: district,
    });

    // 마스코트 자동 변환
    get().transitionMascot(district.mascotVariant);
  },

  // 플레이어 위치 업데이트
  updatePlayerPosition: (x: number, y: number, z: number) => {
    set({ playerPosition: { x, y, z } });

    // POI 근접 체크는 별도 훅에서 처리
  },

  // POI 선택
  selectPOI: (poi: POI | null) => {
    set({
      selectedPOI: poi,
      isInfoPanelOpen: poi !== null,
    });
  },

  // 정보 패널 토글
  toggleInfoPanel: (open?: boolean) => {
    set((state) => ({
      isInfoPanelOpen: open !== undefined ? open : !state.isInfoPanelOpen,
    }));
  },

  // 채팅 토글
  toggleChat: (open?: boolean) => {
    set((state) => ({
      isChatOpen: open !== undefined ? open : !state.isChatOpen,
    }));
  },

  // 음소거 토글
  toggleMute: () => {
    set((state) => ({ isMuted: !state.isMuted }));
  },

  // 볼륨 설정
  setVolume: (volume: number) => {
    set({ masterVolume: Math.max(0, Math.min(1, volume)) });
  },

  // 로딩 상태 설정
  setLoading: (loading: boolean, message?: string) => {
    set({
      isLoading: loading,
      loadingMessage: message || "",
    });
  },

  // 마스코트 변환
  transitionMascot: (variantId: string) => {
    const variant = MASCOT_VARIANTS[variantId as keyof typeof MASCOT_VARIANTS];
    if (!variant) return;

    set((state) => ({
      mascot: {
        ...state.mascot,
        isTransitioning: true,
      },
    }));

    // 트랜지션 애니메이션 후 상태 업데이트
    setTimeout(() => {
      set((state) => ({
        mascot: {
          ...state.mascot,
          currentVariant: variant,
          currentAnimation: variant.defaultAnimation,
          isTransitioning: false,
        },
      }));
    }, 1500); // 1.5초 트랜지션
  },
}));

// 셀렉터 (성능 최적화)
export const useCurrentDistrict = () =>
  useGameStore((state) => state.currentDistrict);

export const useMascotState = () =>
  useGameStore((state) => state.mascot);

export const useSelectedPOI = () =>
  useGameStore((state) => state.selectedPOI);

export const useAudioState = () =>
  useGameStore((state) => ({
    isMuted: state.isMuted,
    masterVolume: state.masterVolume,
  }));
