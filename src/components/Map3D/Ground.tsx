"use client";

// 지면 컴포넌트

import { useRef } from "react";
import { Mesh } from "three";
import { District } from "@/types";

interface GroundProps {
  district: District;
}

export function Ground({ district }: GroundProps) {
  const meshRef = useRef<Mesh>(null);

  // 지역별 지면 색상
  const getGroundColor = () => {
    switch (district.theme.style) {
      case "traditional":
        return "#8B7355"; // 황토색
      case "nightlife":
        return "#1a1a2e"; // 어두운 남색
      case "artistic":
        return "#4a4a4a"; // 회색 (콘크리트)
      case "modern":
        return "#2d2d2d"; // 진한 회색
      default:
        return "#555555";
    }
  };

  return (
    <group>
      {/* 메인 지면 */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200, 32, 32]} />
        <meshStandardMaterial
          color={getGroundColor()}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* 도로 표시 (간단한 그리드) */}
      <gridHelper
        args={[200, 20, "#666666", "#444444"]}
        position={[0, 0.01, 0]}
      />

      {/* 경복궁 특수: 자갈길 효과 */}
      {district.id === "gyeongbokgung" && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
        >
          <planeGeometry args={[30, 100]} />
          <meshStandardMaterial
            color="#C4A77D"
            roughness={1}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}

      {/* 이태원 특수: 네온 라인 */}
      {district.id === "itaewon" && (
        <>
          <mesh position={[-30, 0.1, 0]}>
            <boxGeometry args={[0.5, 0.2, 100]} />
            <meshStandardMaterial
              color="#FF1493"
              emissive="#FF1493"
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={[30, 0.1, 0]}>
            <boxGeometry args={[0.5, 0.2, 100]} />
            <meshStandardMaterial
              color="#00CED1"
              emissive="#00CED1"
              emissiveIntensity={0.5}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
