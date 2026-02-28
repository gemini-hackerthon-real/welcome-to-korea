"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { CameraPreset } from "@/types/camera";
import ScreenshotPanel from "@/components/UI/ScreenshotPanel";

const RealisticMap = dynamic(() => import("@/components/Map3D/RealisticMap"), {
  ssr: false,
  loading: () => <MapLoading />,
});

const SeoulMap = dynamic(() => import("@/components/SeoulMap/SeoulMap"), {
  ssr: false,
  loading: () => <MapLoading />,
});

function MapLoading() {
  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-bounce">🗺️</div>
        <p className="text-white">로딩 중...</p>
      </div>
    </div>
  );
}

interface District {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// 지역 ID와 District 매핑
const DISTRICTS: Record<string, District> = {
  gyeongbokgung: { id: "gyeongbokgung", name: "경복궁", icon: "🏯", color: "#8B4513" },
  hongdae: { id: "hongdae", name: "홍대", icon: "🎨", color: "#FF6B6B" },
  itaewon: { id: "itaewon", name: "이태원", icon: "🌙", color: "#9333EA" },
  gangnam: { id: "gangnam", name: "강남", icon: "🏢", color: "#3B82F6" },
};

// 지역별 구글맵 좌표
const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  gyeongbokgung: { lat: 37.5796, lng: 126.9770 },
  hongdae: { lat: 37.5563, lng: 126.9234 },
  itaewon: { lat: 37.5340, lng: 126.9946 },
  gangnam: { lat: 37.4980, lng: 127.0276 },
};

export default function Home() {
  const [currentDistrict, setCurrentDistrict] = useState<District | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [screenshotPanelOpen, setScreenshotPanelOpen] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset | undefined>(undefined);
  const [mapTargetLocation, setMapTargetLocation] = useState<{
    placeId: string;
    lat: number;
    lng: number;
  } | null>(null);

  const handleDistrictSelect = useCallback((district: District) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentDistrict(district);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 300);
  }, []);

  const handleBackToMap = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentDistrict(null);
      setCameraPreset(undefined);
      setScreenshotPanelOpen(false);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 300);
  }, []);

  // 스크린샷 분석 후 3D 뷰로 점프 (3D 뷰에서 사용)
  const handleJumpToView = useCallback((preset: CameraPreset, placeId: string) => {
    const district = DISTRICTS[placeId];
    if (!district) return;

    // 현재 지역과 다르면 지역 전환
    if (!currentDistrict || currentDistrict.id !== placeId) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentDistrict(district);
        setCameraPreset(preset);
        setTimeout(() => setIsTransitioning(false), 300);
      }, 300);
    } else {
      // 같은 지역이면 카메라만 이동
      setCameraPreset(preset);
    }
  }, [currentDistrict]);

  // 지도 뷰 (초기 화면)
  if (!currentDistrict) {
    return (
      <main className="relative w-full h-screen bg-black overflow-hidden">
        {/* 전환 오버레이 */}
        <div
          className={`absolute inset-0 bg-black z-50 pointer-events-none transition-opacity duration-300 ${
            isTransitioning ? "opacity-100" : "opacity-0"
          }`}
        />

        <SeoulMap onDistrictSelect={handleDistrictSelect} targetLocation={mapTargetLocation} />

        {/* Header */}
        <div className="absolute top-4 left-4 z-10">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">
            Welcome to Korea
          </h1>
        </div>

        {/* Screenshot Button - 구글 스타일 */}
        <div className="absolute bottom-8 left-4 z-10">
          <button
            onClick={() => setScreenshotPanelOpen(!screenshotPanelOpen)}
            className="flex items-center gap-4 px-5 py-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <span className="text-2xl">{screenshotPanelOpen ? "✕" : "📷"}</span>
            </div>
            <div className="text-left">
              <p className="text-gray-800 font-medium text-base">사진으로 장소 찾기</p>
              <p className="text-gray-500 text-sm">AI가 위치를 인식합니다</p>
            </div>
          </button>
        </div>

        {/* Screenshot Panel */}
        <ScreenshotPanel
          isOpen={screenshotPanelOpen}
          onClose={() => setScreenshotPanelOpen(false)}
          onJumpToView={handleJumpToView}
        />

        {/* Footer */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <p className="text-gray-600 text-xs">Powered by Google Gemini</p>
        </div>
      </main>
    );
  }

  // 3D 뷰 (지역 선택 후)
  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      {/* 전환 오버레이 */}
      <div
        className={`absolute inset-0 bg-black z-50 pointer-events-none transition-opacity duration-300 ${
          isTransitioning ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 3D Map */}
      <RealisticMap district={currentDistrict} onZoomOut={handleBackToMap} cameraPreset={cameraPreset} />

      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          Welcome to Korea
        </h1>
      </div>

      {/* Back Button */}
      <button
        onClick={handleBackToMap}
        className="absolute top-4 right-4 z-10 px-4 py-2 bg-black/70 backdrop-blur rounded-full text-white flex items-center gap-2 hover:bg-black/90 transition-all"
      >
        <span>←</span>
        <span>지도로 돌아가기</span>
      </button>

      {/* Current District Info */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
        <div
          className="px-6 py-3 rounded-full flex items-center gap-3 animate-fade-in"
          style={{ backgroundColor: `${currentDistrict.color}dd` }}
        >
          <span className="text-2xl">{currentDistrict.icon}</span>
          <span className="text-white font-bold text-lg">{currentDistrict.name}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <p className="text-gray-600 text-xs">Powered by Google Gemini</p>
      </div>
    </main>
  );
}
