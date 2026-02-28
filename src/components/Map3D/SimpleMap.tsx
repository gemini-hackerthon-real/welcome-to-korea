"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Float, Sky, Stars, Html, useCursor } from "@react-three/drei";
import * as THREE from "three";

interface District {
  id: string;
  name: string;
  color: string;
}

export default function SimpleMap({ district }: { district: District }) {
  const isNight = district.id === "itaewon";
  const [isDraggingMascot, setIsDraggingMascot] = useState(false);

  return (
    <Canvas camera={{ position: [0, 40, 60], fov: 50 }} shadows>
      <color attach="background" args={[isNight ? "#0a0612" : "#87CEEB"]} />

      {/* 하늘/배경 */}
      {isNight ? (
        <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />
      ) : (
        <>
          <Sky sunPosition={[100, 50, 100]} turbidity={0.3} rayleigh={0.5} />
          {/* 산 배경 (경복궁) */}
          {district.id === "gyeongbokgung" && <Mountains />}
        </>
      )}

      {/* 조명 */}
      <ambientLight intensity={isNight ? 0.2 : 0.6} />
      <directionalLight
        position={[50, 80, 50]}
        intensity={isNight ? 0.3 : 1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      {isNight && (
        <>
          <pointLight position={[0, 10, 0]} color="#FF1493" intensity={50} distance={40} />
          <pointLight position={[-20, 10, 20]} color="#00CED1" intensity={30} distance={30} />
        </>
      )}

      <OrbitControls
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 6}
        minDistance={20}
        maxDistance={150}
        enableDamping
        dampingFactor={0.05}
        enabled={!isDraggingMascot}
      />

      {/* 지역별 렌더링 */}
      {district.id === "gyeongbokgung" && <GyeongbokgungScene />}
      {district.id === "itaewon" && <ItaewonScene />}
      {district.id === "hongdae" && <HongdaeScene />}
      {district.id === "gangnam" && <GangnamScene />}

      {/* 마스코트 */}
      <Mascot district={district} onDragChange={setIsDraggingMascot} />
    </Canvas>
  );
}

// ==================== 경복궁 씬 ====================
function GyeongbokgungScene() {
  return (
    <group>
      {/* 바닥 - 박석 */}
      <CourtYard />

      {/* 근정전 (메인) */}
      <GeunjeongjeonHall position={[0, 0, 0]} />

      {/* 근정문 */}
      <PalaceGate position={[0, 0, -50]} scale={0.8} />

      {/* 좌우 행각 */}
      <Haenggak position={[-35, 0, -20]} rotation={[0, 0, 0]} length={50} />
      <Haenggak position={[35, 0, -20]} rotation={[0, 0, 0]} length={50} />

      {/* 월대 난간 */}
      <Wolldae />

      {/* 품계석 */}
      <RankStones />

      {/* 나무들 */}
      <Trees />
    </group>
  );
}

// 근정전 본전
function GeunjeongjeonHall({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 2단 월대 (기단) */}
      {/* 하층 월대 */}
      <mesh position={[0, 1, 0]} receiveShadow castShadow>
        <boxGeometry args={[40, 2, 30]} />
        <meshStandardMaterial color="#d4c5a9" />
      </mesh>

      {/* 상층 월대 */}
      <mesh position={[0, 3, 0]} receiveShadow castShadow>
        <boxGeometry args={[32, 2, 24]} />
        <meshStandardMaterial color="#e8dcc8" />
      </mesh>

      {/* 계단 (정면) */}
      <Stairs position={[0, 0, -12]} width={8} />
      <Stairs position={[0, 2, -10]} width={6} />

      {/* 본전 1층 */}
      <group position={[0, 4, 0]}>
        {/* 기둥들 */}
        <PillarGrid rows={5} cols={7} spacing={4} height={6} />

        {/* 1층 벽체/창호 */}
        <WallWithDoors position={[0, 3, 9]} width={24} height={6} />
        <WallWithDoors position={[0, 3, -9]} width={24} height={6} />
        <SideWall position={[12, 3, 0]} width={18} height={6} rotation={Math.PI / 2} />
        <SideWall position={[-12, 3, 0]} width={18} height={6} rotation={Math.PI / 2} />
      </group>

      {/* 본전 2층 */}
      <group position={[0, 10, 0]}>
        {/* 2층 바닥 */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[26, 0.5, 20]} />
          <meshStandardMaterial color="#4a3728" />
        </mesh>

        {/* 2층 기둥 */}
        <PillarGrid rows={3} cols={5} spacing={4} height={5} />

        {/* 2층 벽체 */}
        <WallWithWindows position={[0, 2.5, 7]} width={16} height={5} />
      </group>

      {/* 지붕 - 팔작지붕 */}
      <PalaceRoof position={[0, 15.5, 0]} width={34} depth={26} />

      {/* 현판 */}
      <Signboard position={[0, 13, 10]} text="勤政殿" />
    </group>
  );
}

// 기둥 그리드
function PillarGrid({ rows, cols, spacing, height }: { rows: number; cols: number; spacing: number; height: number }) {
  const pillars = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = (j - (cols - 1) / 2) * spacing;
      const z = (i - (rows - 1) / 2) * spacing;
      pillars.push(
        <Pillar key={`${i}-${j}`} position={[x, height / 2, z]} height={height} />
      );
    }
  }
  return <group>{pillars}</group>;
}

// 단일 기둥
function Pillar({ position, height }: { position: [number, number, number]; height: number }) {
  return (
    <group position={position}>
      {/* 기둥 본체 */}
      <mesh castShadow>
        <cylinderGeometry args={[0.35, 0.4, height, 12]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
      {/* 주두 (기둥 머리) */}
      <mesh position={[0, height / 2 + 0.2, 0]}>
        <boxGeometry args={[0.8, 0.4, 0.8]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
    </group>
  );
}

// 창호가 있는 벽
function WallWithDoors({ position, width, height }: { position: [number, number, number]; width: number; height: number }) {
  const doorCount = 5;
  const doorWidth = width / doorCount - 0.5;

  return (
    <group position={position}>
      {Array.from({ length: doorCount }).map((_, i) => {
        const x = (i - (doorCount - 1) / 2) * (width / doorCount);
        return (
          <group key={i} position={[x, 0, 0]}>
            {/* 문틀 */}
            <mesh>
              <boxGeometry args={[doorWidth, height - 0.5, 0.2]} />
              <meshStandardMaterial color="#4a3728" />
            </mesh>
            {/* 창호지 (격자) */}
            <mesh position={[0, 0, 0.15]}>
              <boxGeometry args={[doorWidth - 0.4, height - 1, 0.05]} />
              <meshStandardMaterial color="#f5f5dc" transparent opacity={0.7} />
            </mesh>
            {/* 격자 무늬 */}
            {Array.from({ length: 3 }).map((_, j) => (
              <mesh key={`v${j}`} position={[(j - 1) * (doorWidth / 4), 0, 0.2]}>
                <boxGeometry args={[0.08, height - 1.2, 0.05]} />
                <meshStandardMaterial color="#4a3728" />
              </mesh>
            ))}
            {Array.from({ length: 4 }).map((_, j) => (
              <mesh key={`h${j}`} position={[0, (j - 1.5) * (height / 5), 0.2]}>
                <boxGeometry args={[doorWidth - 0.5, 0.08, 0.05]} />
                <meshStandardMaterial color="#4a3728" />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

function WallWithWindows({ position, width, height }: { position: [number, number, number]; width: number; height: number }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[width, height, 0.3]} />
        <meshStandardMaterial color="#2d5a4a" />
      </mesh>
      {/* 창문들 */}
      {[-4, 0, 4].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.2]}>
          <boxGeometry args={[2.5, 3, 0.1]} />
          <meshStandardMaterial color="#f5f5dc" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function SideWall({ position, width, height, rotation }: { position: [number, number, number]; width: number; height: number; rotation: number }) {
  return (
    <mesh position={position} rotation={[0, rotation, 0]}>
      <boxGeometry args={[width, height, 0.3]} />
      <meshStandardMaterial color="#2d5a4a" />
    </mesh>
  );
}

// 팔작지붕
function PalaceRoof({ position, width, depth }: { position: [number, number, number]; width: number; depth: number }) {
  return (
    <group position={position}>
      {/* 처마 (1단) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width + 4, 0.8, depth + 4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* 지붕 본체 - 곡선 표현 */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[width, 1, depth]} />
        <meshStandardMaterial color="#2d2d2d" />
      </mesh>

      {/* 상층 지붕 */}
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[width - 6, 0.6, depth - 4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* 용마루 */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[width - 10, 1.5, 2]} />
        <meshStandardMaterial color="#2d2d2d" />
      </mesh>

      {/* 추녀마루 (지붕 모서리 곡선) */}
      {[
        [width / 2 + 1, 1, depth / 2 + 1, 0.8],
        [-width / 2 - 1, 1, depth / 2 + 1, -0.8],
        [width / 2 + 1, 1, -depth / 2 - 1, -0.8],
        [-width / 2 - 1, 1, -depth / 2 - 1, 0.8],
      ].map(([x, y, z, rot], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0.3, rot, 0.2]}>
          <boxGeometry args={[3, 0.5, 0.5]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}

      {/* 단청 장식 (처마 아래) */}
      <mesh position={[0, -0.3, depth / 2 + 1.5]}>
        <boxGeometry args={[width + 2, 0.8, 0.3]} />
        <meshStandardMaterial color="#2d8a5e" />
      </mesh>
      <mesh position={[0, -0.3, depth / 2 + 1.8]}>
        <boxGeometry args={[width + 2, 0.4, 0.1]} />
        <meshStandardMaterial color="#c41e3a" />
      </mesh>
      <mesh position={[0, -0.6, depth / 2 + 1.8]}>
        <boxGeometry args={[width + 2, 0.3, 0.1]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>
    </group>
  );
}

// 계단
function Stairs({ position, width }: { position: [number, number, number]; width: number }) {
  return (
    <group position={position}>
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[0, i * 0.5 + 0.25, -i * 0.6]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.5, 0.8]} />
          <meshStandardMaterial color="#d4c5a9" />
        </mesh>
      ))}
    </group>
  );
}

// 현판
function Signboard({ position, text }: { position: [number, number, number]; text: string }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[6, 2, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <Text
        position={[0, 0, 0.2]}
        fontSize={1.2}
        color="#DAA520"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </group>
  );
}

// 근정문
function PalaceGate({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* 기단 */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[30, 2, 12]} />
        <meshStandardMaterial color="#d4c5a9" />
      </mesh>

      {/* 기둥 */}
      {[-10, -5, 0, 5, 10].map((x, i) => (
        <Pillar key={i} position={[x, 5, 0]} height={6} />
      ))}

      {/* 지붕 */}
      <PalaceRoof position={[0, 10, 0]} width={28} depth={14} />
    </group>
  );
}

// 행각 (복도 건물)
function Haenggak({ position, rotation, length }: { position: [number, number, number]; rotation: [number, number, number]; length: number }) {
  return (
    <group position={position} rotation={rotation}>
      {/* 기단 */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[6, 1, length]} />
        <meshStandardMaterial color="#d4c5a9" />
      </mesh>

      {/* 기둥들 */}
      {Array.from({ length: Math.floor(length / 5) }).map((_, i) => {
        const z = (i - Math.floor(length / 10)) * 5;
        return (
          <group key={i}>
            <Pillar position={[-2, 3, z]} height={4} />
            <Pillar position={[2, 3, z]} height={4} />
          </group>
        );
      })}

      {/* 지붕 */}
      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[8, 1, length + 2]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 7, 0]}>
        <boxGeometry args={[4, 1, length]} />
        <meshStandardMaterial color="#2d2d2d" />
      </mesh>
    </group>
  );
}

// 월대 난간
function Wolldae() {
  const posts = [];
  const size = 42;

  // 난간 기둥
  for (let i = -size / 2; i <= size / 2; i += 4) {
    posts.push(
      <mesh key={`front-${i}`} position={[i, 3, -16]} castShadow>
        <boxGeometry args={[0.4, 2, 0.4]} />
        <meshStandardMaterial color="#d4c5a9" />
      </mesh>
    );
    posts.push(
      <mesh key={`back-${i}`} position={[i, 3, 16]} castShadow>
        <boxGeometry args={[0.4, 2, 0.4]} />
        <meshStandardMaterial color="#d4c5a9" />
      </mesh>
    );
  }

  return (
    <group>
      {posts}
      {/* 난간 가로대 */}
      <mesh position={[0, 3.5, -16]}>
        <boxGeometry args={[size, 0.3, 0.3]} />
        <meshStandardMaterial color="#d4c5a9" />
      </mesh>
      <mesh position={[0, 3.5, 16]}>
        <boxGeometry args={[size, 0.3, 0.3]} />
        <meshStandardMaterial color="#d4c5a9" />
      </mesh>
    </group>
  );
}

// 조정 바닥 (박석)
function CourtYard() {
  return (
    <group>
      {/* 메인 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -25]} receiveShadow>
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color="#c9b896" />
      </mesh>

      {/* 박석 패턴 (그리드 라인) */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`h-${i}`} position={[0, 0.02, -55 + i * 3]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[80, 0.1]} />
          <meshStandardMaterial color="#a89878" />
        </mesh>
      ))}
      {Array.from({ length: 27 }).map((_, i) => (
        <mesh key={`v-${i}`} position={[-40 + i * 3, 0.02, -25]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.1, 60]} />
          <meshStandardMaterial color="#a89878" />
        </mesh>
      ))}

      {/* 어도 (가운데 길) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -25]}>
        <planeGeometry args={[3, 60]} />
        <meshStandardMaterial color="#8a7a5a" />
      </mesh>
    </group>
  );
}

// 품계석
function RankStones() {
  return (
    <group>
      {[-12, -8, -4, 4, 8, 12].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.3, -30]}>
            <boxGeometry args={[1, 0.6, 0.3]} />
            <meshStandardMaterial color="#888" />
          </mesh>
          <mesh position={[x, 0.3, -38]}>
            <boxGeometry args={[1, 0.6, 0.3]} />
            <meshStandardMaterial color="#888" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 나무들
function Trees() {
  const positions = [
    [-45, 0, 20], [45, 0, 20], [-45, 0, -30], [45, 0, -30],
    [-50, 0, 0], [50, 0, 0], [-45, 0, -50], [45, 0, -50],
  ];

  return (
    <group>
      {positions.map(([x, y, z], i) => (
        <Tree key={i} position={[x, y, z]} />
      ))}
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 줄기 */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.5, 4, 8]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
      {/* 잎 */}
      <mesh position={[0, 5, 0]} castShadow>
        <sphereGeometry args={[3, 12, 12]} />
        <meshStandardMaterial color="#2E7D32" />
      </mesh>
      <mesh position={[1.5, 4, 1]} castShadow>
        <sphereGeometry args={[2, 10, 10]} />
        <meshStandardMaterial color="#388E3C" />
      </mesh>
      <mesh position={[-1.5, 4.5, -0.5]} castShadow>
        <sphereGeometry args={[2.2, 10, 10]} />
        <meshStandardMaterial color="#1B5E20" />
      </mesh>
    </group>
  );
}

// 산 배경
function Mountains() {
  return (
    <group position={[0, 0, 80]}>
      {/* 북악산 (중앙) */}
      <mesh position={[0, 15, 0]}>
        <coneGeometry args={[60, 50, 8]} />
        <meshStandardMaterial color="#3a5a40" />
      </mesh>
      <mesh position={[0, 25, -10]}>
        <coneGeometry args={[40, 40, 8]} />
        <meshStandardMaterial color="#4a7c4e" />
      </mesh>

      {/* 좌측 산 */}
      <mesh position={[-70, 10, 20]}>
        <coneGeometry args={[50, 35, 6]} />
        <meshStandardMaterial color="#3a5a40" />
      </mesh>

      {/* 우측 산 */}
      <mesh position={[70, 12, 10]}>
        <coneGeometry args={[55, 40, 7]} />
        <meshStandardMaterial color="#2d4a35" />
      </mesh>

      {/* 원경 산 */}
      <mesh position={[0, 20, 50]}>
        <coneGeometry args={[100, 60, 8]} />
        <meshStandardMaterial color="#6b8e6b" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

// ==================== 이태원 씬 ====================
function ItaewonScene() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* 도로 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[12, 100]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* 네온 도로 */}
      <mesh position={[-6.5, 0.1, 0]}>
        <boxGeometry args={[0.3, 0.2, 100]} />
        <meshStandardMaterial color="#FF1493" emissive="#FF1493" emissiveIntensity={2} />
      </mesh>
      <mesh position={[6.5, 0.1, 0]}>
        <boxGeometry args={[0.3, 0.2, 100]} />
        <meshStandardMaterial color="#00CED1" emissive="#00CED1" emissiveIntensity={2} />
      </mesh>

      {/* 클럽 건물들 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (18 + Math.random() * 8);
        const z = -45 + i * 8;
        const height = 12 + Math.random() * 10;
        const neonColors = ["#FF1493", "#00CED1", "#FFD700", "#FF4500", "#9400D3"];
        const neonColor = neonColors[i % neonColors.length];

        return (
          <ClubBuilding key={i} position={[x, 0, z]} height={height} neonColor={neonColor} />
        );
      })}
    </group>
  );
}

function ClubBuilding({ position, height, neonColor }: { position: [number, number, number]; height: number; neonColor: string }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[10, height, 8]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* 네온 사인 */}
      <mesh position={[0, height - 2, 4.1]}>
        <boxGeometry args={[8, 2, 0.2]} />
        <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={3} />
      </mesh>

      {/* 창문 조명 */}
      {Array.from({ length: Math.floor(height / 4) }).map((_, i) => (
        <mesh key={i} position={[0, 2 + i * 4, 4.1]}>
          <boxGeometry args={[6, 1.5, 0.1]} />
          <meshStandardMaterial
            color={neonColor}
            emissive={neonColor}
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}

      <pointLight position={[0, 3, 6]} color={neonColor} intensity={15} distance={12} />
    </group>
  );
}

// ==================== 홍대 씬 ====================
function HongdaeScene() {
  const colors = ["#9370DB", "#FF6347", "#00FA9A", "#FFB6C1", "#87CEEB", "#FFA500"];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>

      {/* 버스킹 무대 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#555" />
      </mesh>

      {/* 아트 건물들 */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 20 + Math.random() * 25;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const height = 6 + Math.random() * 12;
        const color = colors[i % colors.length];

        return (
          <ArtBuilding key={i} position={[x, 0, z]} height={height} color={color} />
        );
      })}
    </group>
  );
}

function ArtBuilding({ position, height, color }: { position: [number, number, number]; height: number; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[6 + Math.random() * 4, height, 6 + Math.random() * 4]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* 그래피티 */}
      <mesh position={[3.1, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5, height - 2]} />
        <meshStandardMaterial
          color={["#FF6347", "#9370DB", "#00FA9A"][Math.floor(Math.random() * 3)]}
        />
      </mesh>
    </group>
  );
}

// ==================== 강남 씬 ====================
function GangnamScene() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#1f1f1f" />
      </mesh>

      {/* 대로 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[20, 120]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* 고층 빌딩들 */}
      {[
        [-30, -30, 45], [-30, 30, 50], [30, -30, 55], [30, 30, 40],
        [-35, 0, 60], [35, 0, 48], [0, -40, 42], [0, 40, 52]
      ].map(([x, z, h], i) => (
        <Skyscraper key={i} position={[x, 0, z]} height={h} />
      ))}
    </group>
  );
}

function Skyscraper({ position, height }: { position: [number, number, number]; height: number }) {
  const floors = Math.floor(height / 3);

  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[14, height, 14]} />
        <meshStandardMaterial color="#4a5568" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 유리창 그리드 */}
      {Array.from({ length: floors }).map((_, i) => (
        <mesh key={i} position={[0, 2 + i * 3, 7.1]}>
          <planeGeometry args={[12, 2.2]} />
          <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.2} metalness={0.9} />
        </mesh>
      ))}

      {/* 옥상 */}
      <mesh position={[0, height + 1, 0]}>
        <boxGeometry args={[6, 2, 6]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

// ==================== 마스코트 ====================
function Mascot({ district, onDragChange }: { district: District; onDragChange: (dragging: boolean) => void }) {
  const ref = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<[number, number, number]>([
    0, 8, district.id === "gyeongbokgung" ? -25 : 0
  ]);
  const { camera, raycaster, pointer } = useThree();

  // 커서 변경
  useCursor(isDragging);

  // 드래그 시작
  const onPointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    onDragChange(true);
  };

  // 드래그 중
  const onPointerMove = (e: any) => {
    if (!isDragging) return;
    e.stopPropagation();

    // 바닥 평면과의 교차점 계산
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -8);
    const intersection = new THREE.Vector3();
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(plane, intersection);

    if (intersection) {
      setPosition([intersection.x, 8, intersection.z]);
    }
  };

  // 드래그 끝
  const onPointerUp = () => {
    setIsDragging(false);
    onDragChange(false);
  };

  useFrame((state) => {
    if (!ref.current || isDragging) return;
    const t = state.clock.elapsedTime;

    // 부유 애니메이션 (드래그 중이 아닐 때만)
    ref.current.position.y = position[1] + Math.sin(t * 2) * 0.5;

    switch (district.id) {
      case "itaewon":
        ref.current.rotation.y = Math.sin(t * 4) * 0.4;
        break;
      case "hongdae":
        ref.current.rotation.z = Math.sin(t * 3) * 0.15;
        break;
      case "gangnam":
        ref.current.rotation.y += 0.005;
        break;
      default:
        ref.current.rotation.y = Math.sin(t * 0.8) * 0.15;
    }
  });

  return (
    <group
      ref={ref}
      position={position}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* 드래그 영역 (투명 히트박스) */}
      <mesh visible={false}>
        <sphereGeometry args={[4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* 몸통 */}
      <mesh castShadow>
        <capsuleGeometry args={[1.2, 2, 12, 24]} />
        <meshStandardMaterial color={isDragging ? "#FFD700" : district.color} />
      </mesh>

      {/* 머리 */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[1.5, 24, 24]} />
        <meshStandardMaterial color="#FFE4B5" />
      </mesh>

      {/* 눈 */}
      <mesh position={[-0.5, 2.7, 1.2]}>
        <sphereGeometry args={[0.25]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[-0.5, 2.75, 1.35]}>
        <sphereGeometry args={[0.08]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[0.5, 2.7, 1.2]}>
        <sphereGeometry args={[0.25]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[0.5, 2.75, 1.35]}>
        <sphereGeometry args={[0.08]} />
        <meshStandardMaterial color="#fff" />
      </mesh>

      {/* 볼터치 */}
      <mesh position={[-1, 2.3, 1]}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial color="#FF6B6B" transparent opacity={0.6} />
      </mesh>
      <mesh position={[1, 2.3, 1]}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial color="#FF6B6B" transparent opacity={0.6} />
      </mesh>

      {/* 미소 */}
      <mesh position={[0, 2.1, 1.35]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.25, 0.08, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* 악세서리 */}
      <MascotAccessory districtId={district.id} />
    </group>
  );
}

function MascotAccessory({ districtId }: { districtId: string }) {
  switch (districtId) {
    case "gyeongbokgung":
      return (
        <group position={[0, 4.3, 0]}>
          <mesh>
            <cylinderGeometry args={[2, 2, 0.3, 24]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 1.2, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[1.8, -0.5, 0]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.05, 0.05, 2.5, 8]} />
            <meshStandardMaterial color="#8B0000" />
          </mesh>
        </group>
      );
    case "itaewon":
      return (
        <group position={[0, 3.5, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[1.5, 0.12, 12, 24, Math.PI]} />
            <meshStandardMaterial color="#222" metalness={0.8} />
          </mesh>
          <mesh position={[-1.5, -0.3, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
            <meshStandardMaterial color="#FF1493" emissive="#FF1493" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[1.5, -0.3, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
            <meshStandardMaterial color="#FF1493" emissive="#FF1493" emissiveIntensity={0.5} />
          </mesh>
        </group>
      );
    case "hongdae":
      return (
        <group position={[0.3, 4, 0]} rotation={[0.2, 0, 0.3]}>
          <mesh>
            <sphereGeometry args={[1.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#9370DB" />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.15]} />
            <meshStandardMaterial color="#9370DB" />
          </mesh>
        </group>
      );
    case "gangnam":
      return (
        <group position={[0, 2.7, 1.5]}>
          <mesh position={[-0.5, 0, 0]}>
            <boxGeometry args={[0.6, 0.35, 0.15]} />
            <meshStandardMaterial color="#000" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0.5, 0, 0]}>
            <boxGeometry args={[0.6, 0.35, 0.15]} />
            <meshStandardMaterial color="#000" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.4, 0.08, 0.08]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.9} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}
