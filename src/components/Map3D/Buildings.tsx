"use client";

// 건물 컴포넌트

import { useMemo } from "react";
import { District } from "@/types";

interface BuildingsProps {
  district: District;
}

interface BuildingData {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  type: "traditional" | "modern" | "shop" | "landmark";
}

export function Buildings({ district }: BuildingsProps) {
  // 지역별 건물 배치 생성
  const buildings = useMemo(() => {
    return generateBuildings(district);
  }, [district.id]);

  return (
    <group>
      {buildings.map((building, index) => (
        <Building key={`${district.id}-building-${index}`} data={building} />
      ))}
    </group>
  );
}

function Building({ data }: { data: BuildingData }) {
  const { position, size, color, type } = data;

  // 건물 타입별 렌더링
  if (type === "traditional") {
    return <TraditionalBuilding position={position} size={size} color={color} />;
  }

  // 기본 모던 건물
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
    </mesh>
  );
}

// 전통 건물 (경복궁 스타일 - 기와지붕)
function TraditionalBuilding({
  position,
  size,
  color,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  const [width, height, depth] = size;

  return (
    <group position={position}>
      {/* 건물 본체 */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* 기와지붕 (간단한 피라미드 형태) */}
      <mesh position={[0, height + 2, 0]} castShadow>
        <coneGeometry args={[width * 0.8, 4, 4]} />
        <meshStandardMaterial color="#2F4F4F" roughness={0.9} />
      </mesh>

      {/* 처마 */}
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[width * 1.3, 0.5, depth * 1.3]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>
    </group>
  );
}

// 지역별 건물 데이터 생성
function generateBuildings(district: District): BuildingData[] {
  const buildings: BuildingData[] = [];
  const palette = district.theme.colorPalette;

  switch (district.id) {
    case "gyeongbokgung":
      // 궁궐 건물 배치
      buildings.push(
        // 근정전 (중앙 메인 건물)
        { position: [0, 0, 50], size: [25, 15, 20], color: palette[0], type: "traditional" },
        // 광화문
        { position: [0, 0, -50], size: [30, 12, 10], color: palette[0], type: "traditional" },
        // 경회루
        { position: [-40, 0, 30], size: [20, 8, 15], color: palette[0], type: "traditional" },
        // 좌우 행각
        { position: [-35, 0, 0], size: [8, 6, 60], color: palette[3], type: "traditional" },
        { position: [35, 0, 0], size: [8, 6, 60], color: palette[3], type: "traditional" },
      );
      break;

    case "itaewon":
      // 클럽/바 건물 배치
      for (let i = 0; i < 15; i++) {
        const x = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        const height = 10 + Math.random() * 20;
        buildings.push({
          position: [x, height / 2, z],
          size: [8 + Math.random() * 5, height, 8 + Math.random() * 5],
          color: palette[Math.floor(Math.random() * palette.length)],
          type: "modern",
        });
      }
      break;

    case "hongdae":
      // 예술적인 불규칙 건물
      for (let i = 0; i < 20; i++) {
        const x = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 80;
        const height = 5 + Math.random() * 15;
        buildings.push({
          position: [x, height / 2, z],
          size: [6 + Math.random() * 8, height, 6 + Math.random() * 8],
          color: palette[Math.floor(Math.random() * palette.length)],
          type: "shop",
        });
      }
      break;

    case "gangnam":
      // 고층 빌딩
      for (let i = 0; i < 12; i++) {
        const x = (i % 4 - 1.5) * 30;
        const z = (Math.floor(i / 4) - 1) * 40;
        const height = 30 + Math.random() * 40;
        buildings.push({
          position: [x, height / 2, z],
          size: [15, height, 15],
          color: palette[Math.floor(Math.random() * 3)],
          type: "modern",
        });
      }
      break;
  }

  return buildings;
}
