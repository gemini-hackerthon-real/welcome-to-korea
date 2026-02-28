"use client";

// 3D 맵 메인 컴포넌트

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { Suspense } from "react";
import { useCurrentDistrict } from "@/store/gameStore";
import { Ground } from "./Ground";
import { Buildings } from "./Buildings";
import { POIMarkers } from "./POIMarkers";
import { Mascot } from "../Mascot/Mascot";
import { LoadingScreen } from "../UI/LoadingScreen";

export function Map3D() {
  const district = useCurrentDistrict();

  if (!district) {
    return <LoadingScreen message="지역 데이터 로딩 중..." />;
  }

  // 지역별 환경 설정
  const getEnvironmentPreset = () => {
    switch (district.theme.style) {
      case "traditional":
        return "dawn";
      case "nightlife":
        return "night";
      case "artistic":
        return "sunset";
      case "modern":
        return "city";
      default:
        return "dawn";
    }
  };

  return (
    <div className="w-full h-screen">
      <Canvas shadows>
        <Suspense fallback={null}>
          {/* 카메라 설정 - Bird's Eye View */}
          <PerspectiveCamera
            makeDefault
            position={[0, 80, 80]}
            fov={50}
            near={0.1}
            far={1000}
          />

          {/* 컨트롤 */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.5}
            minDistance={30}
            maxDistance={150}
            target={[0, 0, 0]}
          />

          {/* 조명 */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[50, 100, 50]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />

          {/* 환경 */}
          <Environment preset={getEnvironmentPreset()} />

          {/* 지면 */}
          <Ground district={district} />

          {/* 건물들 */}
          <Buildings district={district} />

          {/* POI 마커들 */}
          <POIMarkers pois={district.pois} />

          {/* 마스코트 */}
          <Mascot />

          {/* 안개 효과 (깊이감) */}
          <fog
            attach="fog"
            args={[district.theme.colorPalette[0], 100, 200]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
