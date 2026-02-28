"use client";

// POI 마커 컴포넌트

import { useRef, useState } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { Html, Billboard } from "@react-three/drei";
import { POI } from "@/types";
import { useGameStore } from "@/store/gameStore";

interface POIMarkersProps {
  pois: POI[];
}

export function POIMarkers({ pois }: POIMarkersProps) {
  return (
    <group>
      {pois.map((poi) => (
        <POIMarker key={poi.id} poi={poi} />
      ))}
    </group>
  );
}

function POIMarker({ poi }: { poi: POI }) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const selectPOI = useGameStore((state) => state.selectPOI);

  // 부유 애니메이션
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        poi.position.y + 5 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  // POI 타입별 색상
  const getMarkerColor = () => {
    switch (poi.type) {
      case "landmark":
        return "#FFD700"; // 금색
      case "restaurant":
        return "#FF6347"; // 토마토
      case "shop":
        return "#32CD32"; // 라임그린
      case "street_art":
        return "#9370DB"; // 보라
      case "entertainment":
        return "#FF1493"; // 핑크
      default:
        return "#FFFFFF";
    }
  };

  // POI 타입별 아이콘
  const getMarkerIcon = () => {
    switch (poi.type) {
      case "landmark":
        return "🏛️";
      case "restaurant":
        return "🍜";
      case "shop":
        return "🛍️";
      case "street_art":
        return "🎨";
      case "entertainment":
        return "🎵";
      default:
        return "📍";
    }
  };

  const handleClick = () => {
    selectPOI(poi);
  };

  return (
    <group position={[poi.position.x, poi.position.y, poi.position.z]}>
      {/* 마커 기둥 */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 5, 8]} />
        <meshStandardMaterial
          color={getMarkerColor()}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* 마커 구체 */}
      <mesh
        ref={meshRef}
        position={[0, 5, 0]}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.3 : 1}
      >
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial
          color={getMarkerColor()}
          emissive={getMarkerColor()}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </mesh>

      {/* 라벨 */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Html
          position={[0, 8, 0]}
          center
          distanceFactor={15}
          style={{
            transition: "all 0.2s",
            opacity: hovered ? 1 : 0.8,
            transform: `scale(${hovered ? 1.1 : 1})`,
          }}
        >
          <div
            className="px-3 py-2 rounded-lg text-center cursor-pointer select-none"
            style={{
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(4px)",
              border: `2px solid ${getMarkerColor()}`,
              minWidth: "80px",
            }}
            onClick={handleClick}
          >
            <div className="text-2xl mb-1">{getMarkerIcon()}</div>
            <div className="text-white text-sm font-bold whitespace-nowrap">
              {poi.nameKo}
            </div>
            <div className="text-gray-400 text-xs">{poi.name}</div>
          </div>
        </Html>
      </Billboard>

      {/* 바닥 하이라이트 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial
          color={getMarkerColor()}
          transparent
          opacity={hovered ? 0.4 : 0.2}
        />
      </mesh>
    </group>
  );
}
