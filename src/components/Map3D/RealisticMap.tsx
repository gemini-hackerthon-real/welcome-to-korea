"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import type { CameraPreset } from "@/types/camera";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, useCursor, Text, Sky, Stars } from "@react-three/drei";
import * as THREE from "three";

interface District {
  id: string;
  name: string;
  color: string;
}

interface RealisticMapProps {
  district: District;
  onZoomOut?: () => void;
  cameraPreset?: CameraPreset;
}

// 줌 아웃 임계값 - 이 이상 줌 아웃하면 지도로 전환
const ZOOM_OUT_THRESHOLD = 180;

// 실제 좌표 (위도/경도) → 3D 좌표 변환
// 중심점 기준으로 미터 단위로 변환
const CENTER_COORDS = {
  gyeongbokgung: { lat: 37.5796, lng: 126.977 },
  itaewon: { lat: 37.5345, lng: 126.9946 },
  hongdae: { lat: 37.5563, lng: 126.9234 },
  gangnam: { lat: 37.498, lng: 127.0276 },
};

// 위도/경도를 미터로 변환 (근사치)
function latLngToMeters(lat: number, lng: number, centerLat: number, centerLng: number) {
  const latDiff = (lat - centerLat) * 111320; // 1도 ≈ 111.32km
  const lngDiff = (lng - centerLng) * 111320 * Math.cos(centerLat * Math.PI / 180);
  return { x: lngDiff, z: -latDiff }; // z는 북쪽이 -
}

// 실제 POI/건물 좌표 데이터
const REAL_LOCATIONS: Record<string, Array<{
  name: string;
  lat: number;
  lng: number;
  type: string;
  height?: number;
  width?: number;
  depth?: number;
}>> = {
  gyeongbokgung: [
    // 주요 전각 (실제 조사한 치수 반영: 미터 단위)
    // 근정전: 30m(W) x 21m(D) x 25m(H), 2단 월대 포함
    { name: "근정전", lat: 37.5786, lng: 126.9770, type: "palace_double", height: 25, width: 30, depth: 21 },
    // 광화문: 거대 석축 베이스 + 2층 누각
    { name: "광화문", lat: 37.5759, lng: 126.9769, type: "gate_double", height: 18, width: 40, depth: 15 },
    // 흥례문
    { name: "흥례문", lat: 37.5770, lng: 126.9770, type: "gate", height: 12, width: 30, depth: 12 },
    // 근정문
    { name: "근정문", lat: 37.5779, lng: 126.9770, type: "gate", height: 11, width: 25, depth: 10 },
    // 경회루: 34m(W) x 28m(D) x 21m(H), 연못 위 돌기둥 구조
    { name: "경회루", lat: 37.5798, lng: 126.9752, type: "pavilion_water", height: 21, width: 34, depth: 28 },
    // 사정전 (왕의 집무실)
    { name: "사정전", lat: 37.5796, lng: 126.9770, type: "palace", height: 13, width: 22, depth: 16 },
    // 강녕전 (왕의 침전)
    { name: "강녕전", lat: 37.5805, lng: 126.9770, type: "palace", height: 12, width: 24, depth: 18 },
    // 교태전 (왕비의 침전)
    { name: "교태전", lat: 37.5812, lng: 126.9770, type: "palace", height: 11, width: 22, depth: 16 },
    // 수정전
    { name: "수정전", lat: 37.5788, lng: 126.9755, type: "palace", height: 10, width: 25, depth: 15 },
    // 자경전
    { name: "자경전", lat: 37.5815, lng: 126.9785, type: "palace", height: 10, width: 20, depth: 15 },
    // 향원정 (연못 위 육각형 정자)
    { name: "향원정", lat: 37.5825, lng: 126.9773, type: "pavilion_hex", height: 9, width: 10, depth: 10 },
    // 집옥재
    { name: "집옥재", lat: 37.5835, lng: 126.9765, type: "pavilion", height: 10, width: 18, depth: 12 },
    // 중심축 행각
    { name: "서행각", lat: 37.5786, lng: 126.9760, type: "corridor", height: 6, width: 5, depth: 40 },
    { name: "동행각", lat: 37.5786, lng: 126.9780, type: "corridor", height: 6, width: 5, depth: 40 },
    // 국립민속박물관
    { name: "민속박물관", lat: 37.5815, lng: 126.9800, type: "building", height: 25, width: 30, depth: 30 },
  ],
  itaewon: [
    // 주요 랜드마크
    { name: "해밀턴호텔", lat: 37.5343, lng: 126.9942, type: "hotel", height: 35, width: 25, depth: 20 },
    { name: "이태원역", lat: 37.5345, lng: 126.9946, type: "station", height: 6, width: 30, depth: 20 },
    { name: "세계음식거리", lat: 37.5340, lng: 126.9930, type: "restaurant", height: 15, width: 40, depth: 10 },
    { name: "앤틱가구거리", lat: 37.5355, lng: 126.9935, type: "shop", height: 12, width: 30, depth: 10 },
    // 클럽 & 바
    { name: "클럽 A", lat: 37.5350, lng: 126.9960, type: "club", height: 18, width: 12, depth: 12 },
    { name: "클럽 B", lat: 37.5348, lng: 126.9955, type: "club", height: 22, width: 14, depth: 14 },
    { name: "클럽 C", lat: 37.5338, lng: 126.9958, type: "club", height: 16, width: 12, depth: 10 },
    { name: "라운지바", lat: 37.5352, lng: 126.9965, type: "club", height: 14, width: 10, depth: 10 },
    { name: "칵테일바", lat: 37.5346, lng: 126.9968, type: "club", height: 12, width: 8, depth: 8 },
    // 레스토랑 & 카페
    { name: "멕시칸푸드", lat: 37.5336, lng: 126.9935, type: "restaurant", height: 10, width: 12, depth: 10 },
    { name: "터키음식점", lat: 37.5342, lng: 126.9925, type: "restaurant", height: 11, width: 10, depth: 10 },
    { name: "인도음식점", lat: 37.5338, lng: 126.9920, type: "restaurant", height: 10, width: 11, depth: 9 },
    { name: "태국음식점", lat: 37.5345, lng: 126.9918, type: "restaurant", height: 12, width: 10, depth: 10 },
    { name: "이탈리안", lat: 37.5350, lng: 126.9928, type: "restaurant", height: 11, width: 12, depth: 10 },
    // 상가 건물
    { name: "패션몰", lat: 37.5352, lng: 126.9938, type: "shop", height: 20, width: 16, depth: 12 },
    { name: "편집샵", lat: 37.5358, lng: 126.9950, type: "shop", height: 14, width: 10, depth: 10 },
    { name: "빈티지샵", lat: 37.5355, lng: 126.9958, type: "shop", height: 12, width: 8, depth: 8 },
    { name: "게스트하우스", lat: 37.5360, lng: 126.9940, type: "hotel", height: 18, width: 14, depth: 12 },
    { name: "루프탑바", lat: 37.5348, lng: 126.9922, type: "club", height: 25, width: 15, depth: 12 },
  ],
  hongdae: [
    // 주요 교통 및 랜드마크
    { name: "홍대입구역 9번출구", lat: 37.5577, lng: 126.9237, type: "station", height: 6, width: 25, depth: 20 },
    { name: "홍대입구역 3번출구", lat: 37.5585, lng: 126.9245, type: "station", height: 5, width: 20, depth: 15 },
    { name: "상상마당", lat: 37.5509, lng: 126.9214, type: "building", height: 25, width: 22, depth: 18 },
    { name: "홍대놀이터", lat: 37.5526, lng: 126.9216, type: "plaza", height: 2, width: 30, depth: 30 },
    
    // 주요 거리
    { name: "걷고싶은거리", lat: 37.5565, lng: 126.9238, type: "street", height: 12, width: 45, depth: 8 },
    { name: "경의선 숲길(연트럴)", lat: 37.5595, lng: 126.9255, type: "street", height: 8, width: 60, depth: 12 },
    { name: "버스킹 메인 스테이지", lat: 37.5560, lng: 126.9228, type: "stage", height: 3, width: 15, depth: 15 },
    
    // 클럽 거리 (밀집 지역)
    { name: "클럽 NB2", lat: 37.5515, lng: 126.9225, type: "club", height: 18, width: 14, depth: 14 },
    { name: "클럽 아우라", lat: 37.5512, lng: 126.9220, type: "club", height: 20, width: 16, depth: 15 },
    { name: "클럽 FF", lat: 37.5505, lng: 126.9222, type: "club", height: 14, width: 10, depth: 10 },
    
    // 연남동 & 카페 지역
    { name: "연남동 카페거리 1", lat: 37.5605, lng: 126.9260, type: "cafe", height: 12, width: 12, depth: 10 },
    { name: "연남동 카페거리 2", lat: 37.5610, lng: 126.9265, type: "cafe", height: 14, width: 10, depth: 12 },
    { name: "루프탑 카페", lat: 37.5572, lng: 126.9220, type: "cafe", height: 14, width: 10, depth: 10 },
    
    // 아트 & 쇼핑
    { name: "오브젝트 성수/홍대", lat: 37.5558, lng: 126.9215, type: "art", height: 11, width: 15, depth: 12 },
    { name: "AK플라자 홍대", lat: 37.5570, lng: 126.9245, type: "shop", height: 35, width: 30, depth: 25 },
    { name: "스타일난다", lat: 37.5545, lng: 126.9225, type: "shop", height: 15, width: 18, depth: 15 },
    
    // 먹자 골목
    { name: "홍대 맛집 거리 1", lat: 37.5548, lng: 126.9236, type: "restaurant", height: 10, width: 14, depth: 12 },
    { name: "홍대 맛집 거리 2", lat: 37.5562, lng: 126.9258, type: "restaurant", height: 12, width: 16, depth: 14 },
  ],
  gangnam: [
    // 강남역 주변
    { name: "강남역", lat: 37.4980, lng: 127.0276, type: "station", height: 8, width: 40, depth: 25 },
    { name: "강남역지하상가", lat: 37.4978, lng: 127.0276, type: "shop", height: 4, width: 60, depth: 30 },
    // 고층 빌딩
    { name: "GT타워", lat: 37.4985, lng: 127.0285, type: "skyscraper", height: 80, width: 25, depth: 25 },
    { name: "역삼빌딩", lat: 37.4990, lng: 127.0268, type: "skyscraper", height: 65, width: 22, depth: 22 },
    { name: "테헤란빌딩", lat: 37.4975, lng: 127.0290, type: "skyscraper", height: 55, width: 20, depth: 20 },
    { name: "스타타워", lat: 37.4970, lng: 127.0265, type: "skyscraper", height: 70, width: 24, depth: 24 },
    { name: "파이낸스센터", lat: 37.4995, lng: 127.0280, type: "skyscraper", height: 90, width: 28, depth: 28 },
    { name: "삼성타워", lat: 37.4968, lng: 127.0282, type: "skyscraper", height: 85, width: 26, depth: 26 },
    { name: "포스코타워", lat: 37.4988, lng: 127.0260, type: "skyscraper", height: 75, width: 24, depth: 24 },
    { name: "무역센터", lat: 37.4998, lng: 127.0290, type: "skyscraper", height: 95, width: 30, depth: 30 },
    { name: "아셈타워", lat: 37.4965, lng: 127.0295, type: "skyscraper", height: 60, width: 22, depth: 22 },
    { name: "글라스타워", lat: 37.4992, lng: 127.0255, type: "skyscraper", height: 55, width: 20, depth: 20 },
    // 중형 오피스
    { name: "테크노빌딩", lat: 37.4972, lng: 127.0270, type: "skyscraper", height: 45, width: 18, depth: 18 },
    { name: "IT센터", lat: 37.4982, lng: 127.0250, type: "skyscraper", height: 50, width: 20, depth: 20 },
    { name: "스타트업허브", lat: 37.4960, lng: 127.0275, type: "skyscraper", height: 40, width: 16, depth: 16 },
    { name: "벤처타워", lat: 37.4978, lng: 127.0298, type: "skyscraper", height: 48, width: 18, depth: 18 },
    // 상업시설
    { name: "CGV강남", lat: 37.4975, lng: 127.0258, type: "building", height: 25, width: 20, depth: 18 },
    { name: "백화점", lat: 37.4985, lng: 127.0245, type: "shop", height: 30, width: 35, depth: 30 },
    { name: "신세계", lat: 37.4962, lng: 127.0260, type: "shop", height: 28, width: 32, depth: 28 },
    { name: "카페거리", lat: 37.4958, lng: 127.0272, type: "cafe", height: 12, width: 25, depth: 10 },
  ],
};

export default function RealisticMap({ district, onZoomOut, cameraPreset }: RealisticMapProps) {
  const [isDraggingMascot, setIsDraggingMascot] = useState(false);

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 80, 120], fov: 45 }}
        shadows
      >
        <color attach="background" args={[getBackgroundColor(district.id)]} />
        <fog attach="fog" args={[getBackgroundColor(district.id), 250, 800]} />

        {/* 하늘 배경 */}
        {district.id !== "itaewon" ? (
          <Sky
            distance={450}
            sunPosition={getSunPosition(district.id)}
            inclination={district.id === "hongdae" ? 0.3 : 0.5}
            azimuth={0.25}
            rayleigh={district.id === "gyeongbokgung" ? 0.5 : 1}
          />
        ) : (
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        )}

        <ambientLight intensity={district.id === "itaewon" ? 0.2 : 0.5} />
        <directionalLight
          position={[50, 100, 50]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        {/* 이태원은 밤 분위기 */}
        {district.id === "itaewon" && (
          <>
            <pointLight position={[0, 20, 0]} color="#FF1493" intensity={100} distance={80} />
            <pointLight position={[-30, 15, 30]} color="#00CED1" intensity={60} distance={50} />
            <pointLight position={[30, 15, -30]} color="#FFD700" intensity={60} distance={50} />
          </>
        )}

        <ZoomAwareControls
          enabled={!isDraggingMascot}
          onZoomOut={onZoomOut}
          cameraPreset={cameraPreset}
        />

        {/* 바닥 */}
        <Ground district={district} />

        {/* 도로 그리드 */}
        <Roads district={district} />

        {/* 실제 좌표 기반 건물들 */}
        <RealBuildings district={district} />

        {/* 이태원 거리 장식 */}
        {district.id === "itaewon" && <ItaewonDecorations />}

        {/* 홍대 아트 장식 */}
        {district.id === "hongdae" && (
          <>
            <HongdaeDecorations />
            <HongdaeNPCs />
          </>
        )}

        {/* 마스코트 */}
        <Mascot district={district} onDragChange={setIsDraggingMascot} />

        {/* 좌표 표시 */}
        <CoordinateInfo district={district} />
      </Canvas>

      {/* 정보 오버레이 */}
      <div className="absolute top-20 left-4 bg-black/80 backdrop-blur p-4 rounded-xl text-white max-w-xs border border-white/10">
        <p className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <span className="text-xl">🗺️</span>
          실제 좌표 기반 3D
        </p>
        <p className="text-gray-300 text-xs leading-relaxed">
          Google Maps 좌표를 기반으로 실제 위치에
          <span className="text-yellow-400 font-bold"> 3D 건물</span>을 배치했습니다.
        </p>
        <div className="mt-2 pt-2 border-t border-white/10 text-xs text-gray-400">
          📍 {district.name} ({CENTER_COORDS[district.id as keyof typeof CENTER_COORDS]?.lat.toFixed(4)}, {CENTER_COORDS[district.id as keyof typeof CENTER_COORDS]?.lng.toFixed(4)})
        </div>
      </div>

      {/* 줌 아웃 안내 */}
      {onZoomOut && (
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur px-4 py-2 rounded-lg text-white text-sm">
          🔍 스크롤로 줌 아웃하면 지도로 돌아갑니다
        </div>
      )}
    </div>
  );
}

// 줌 감지 OrbitControls + 카메라 애니메이션
function ZoomAwareControls({
  enabled,
  onZoomOut,
  cameraPreset
}: {
  enabled: boolean;
  onZoomOut?: () => void;
  cameraPreset?: import("@/types/camera").CameraPreset;
}) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const lastDistanceRef = useRef(0);
  const transitionTriggeredRef = useRef(false);

  // 카메라 애니메이션 상태
  const animationRef = useRef<{
    isAnimating: boolean;
    startTime: number;
    duration: number;
    startPosition: THREE.Vector3;
    endPosition: THREE.Vector3;
    startTarget: THREE.Vector3;
    endTarget: THREE.Vector3;
  } | null>(null);
  const lastPresetIdRef = useRef<string | null>(null);

  // Cubic ease-in-out
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // 프리셋이 변경되면 애니메이션 시작
  useEffect(() => {
    if (cameraPreset && cameraPreset.id !== lastPresetIdRef.current && controlsRef.current) {
      lastPresetIdRef.current = cameraPreset.id;

      const duration = cameraPreset.transitionDuration || 2000;
      const startPosition = camera.position.clone();
      const endPosition = new THREE.Vector3(
        cameraPreset.position.x,
        cameraPreset.position.y,
        cameraPreset.position.z
      );
      const startTarget = controlsRef.current.target.clone();
      const endTarget = new THREE.Vector3(
        cameraPreset.target.x,
        cameraPreset.target.y,
        cameraPreset.target.z
      );

      animationRef.current = {
        isAnimating: true,
        startTime: Date.now(),
        duration,
        startPosition,
        endPosition,
        startTarget,
        endTarget,
      };
    }
  }, [cameraPreset, camera]);

  useFrame(() => {
    // 카메라 애니메이션 처리
    const anim = animationRef.current;
    if (anim && anim.isAnimating && controlsRef.current) {
      const elapsed = Date.now() - anim.startTime;
      const progress = Math.min(elapsed / anim.duration, 1);
      const eased = easeInOutCubic(progress);

      // 카메라 위치 보간
      camera.position.lerpVectors(anim.startPosition, anim.endPosition, eased);

      // OrbitControls 타겟 보간
      const target = new THREE.Vector3();
      target.lerpVectors(anim.startTarget, anim.endTarget, eased);
      controlsRef.current.target.copy(target);
      controlsRef.current.update();

      // 애니메이션 완료
      if (progress >= 1) {
        animationRef.current = null;
      }
      return; // 애니메이션 중에는 줌 아웃 체크 스킵
    }

    // 줌 아웃 감지
    if (!controlsRef.current || !onZoomOut) return;

    const distance = camera.position.length();

    // 줌 아웃 감지 (거리가 증가하고 있고, 임계값 초과)
    if (distance > ZOOM_OUT_THRESHOLD && !transitionTriggeredRef.current) {
      if (distance > lastDistanceRef.current) {
        transitionTriggeredRef.current = true;
        onZoomOut();
      }
    }

    lastDistanceRef.current = distance;
  });

  return (
    <OrbitControls
      ref={controlsRef}
      maxPolarAngle={Math.PI / 2.2}
      minPolarAngle={Math.PI / 8}
      minDistance={30}
      maxDistance={250}
      enabled={enabled && !animationRef.current?.isAnimating}
      target={[0, 0, 0]}
    />
  );
}

function getBackgroundColor(districtId: string): string {
  switch (districtId) {
    case "gyeongbokgung": return "#0077be"; // 진하고 맑은 푸른 하늘색
    case "itaewon": return "#0a0612"; // 밤
    case "hongdae": return "#f0e6d3"; // 저녁노을
    case "gangnam": return "#d4e5f7"; // 맑은 낮
    default: return "#87CEEB";
  }
}

function getSunPosition(districtId: string): [number, number, number] {
  switch (districtId) {
    case "gyeongbokgung": return [100, 80, 50]; // 높은 태양 (정오)
    case "hongdae": return [50, 20, 100]; // 낮은 태양 (석양)
    case "gangnam": return [80, 60, 30]; // 오후 태양
    default: return [100, 50, 50];
  }
}

function Ground({ district }: { district: District }) {
  return (
    <group>
      {/* 메인 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color={getGroundColor(district.id)} />
      </mesh>

      {/* 경복궁: 자갈길과 잔디 영역 */}
      {district.id === "gyeongbokgung" && (
        <>
          {/* 중앙 어도 (왕의 길) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
            <planeGeometry args={[4, 80]} />
            <meshStandardMaterial color="#8B7355" />
          </mesh>
          {/* 잔디 영역 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-35, -0.45, 0]}>
            <planeGeometry args={[30, 60]} />
            <meshStandardMaterial color="#4a7c39" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[35, -0.45, 0]}>
            <planeGeometry args={[30, 60]} />
            <meshStandardMaterial color="#4a7c39" />
          </mesh>
          {/* 연못 (경회루 앞) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, -0.3, -10]}>
            <circleGeometry args={[12, 32]} />
            <meshStandardMaterial color="#4a90a4" transparent opacity={0.8} />
          </mesh>
        </>
      )}

      {/* 이태원: 네온 라인과 어두운 바닥 */}
      {district.id === "itaewon" && (
        <>
          {/* 보도블록 패턴 */}
          {Array.from({ length: 10 }).map((_, i) => (
            <mesh key={`sidewalk-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-50 + i * 12, -0.45, 0]}>
              <planeGeometry args={[10, 80]} />
              <meshStandardMaterial color={i % 2 === 0 ? "#252535" : "#1e1e2e"} />
            </mesh>
          ))}
        </>
      )}

      {/* 홍대: 다채로운 바닥 패턴 */}
      {district.id === "hongdae" && (
        <>
          {/* 걷고싶은거리 - 보도블록 패턴 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
            <planeGeometry args={[100, 40]} />
            <meshStandardMaterial color="#d4a574" />
          </mesh>
          {/* 보도블록 그리드 라인 */}
          {Array.from({ length: 10 }).map((_, i) => (
            <mesh key={`grid-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, -20 + i * 4]}>
              <planeGeometry args={[100, 0.1]} />
              <meshStandardMaterial color="#b98a5a" />
            </mesh>
          ))}
          {/* 버스킹존 원형 스테이지 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, -0.35, -5]}>
            <circleGeometry args={[10, 32]} />
            <meshStandardMaterial color="#8b6914" />
          </mesh>
        </>
      )}

      {/* 강남: 격자형 도시 패턴 */}
      {district.id === "gangnam" && (
        <>
          {/* 인도 */}
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={`block-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-42 + i * 12, -0.45, 0]}>
              <planeGeometry args={[10, 80]} />
              <meshStandardMaterial color={i % 2 === 0 ? "#3a3a3a" : "#2d2d2d"} />
            </mesh>
          ))}
          {/* 횡단보도 */}
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={`cross-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, -30 + i * 15]}>
              <planeGeometry args={[12, 3]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          ))}
        </>
      )}

      {/* 원경 산/언덕 (경복궁) - 북악산 배경 (맨 뒤로 이동) */}
      {district.id === "gyeongbokgung" && (
        <group position={[0, 0, -250]} renderOrder={0}>
          {/* 북악산 (중앙, 멀리) */}
          <mesh position={[0, 40, -50]}>
            <coneGeometry args={[120, 80, 8]} />
            <meshStandardMaterial color="#1a2e1a" />
          </mesh>
          {/* 인왕산 (왼쪽) */}
          <mesh position={[-150, 25, -20]}>
            <coneGeometry args={[100, 60, 8]} />
            <meshStandardMaterial color="#2d3e2d" />
          </mesh>
          {/* 낙산 (오른쪽) */}
          <mesh position={[150, 20, -30]}>
            <coneGeometry args={[90, 50, 8]} />
            <meshStandardMaterial color="#2d3e2d" />
          </mesh>
        </group>
      )}
    </group>
  );
}

function getGroundColor(districtId: string): string {
  switch (districtId) {
    case "gyeongbokgung": return "#e2b37a"; // 밝은 모래/황토색 마당
    case "itaewon": return "#1a1a2e"; // 어두운 아스팔트
    case "hongdae": return "#a0968c"; // 따뜻한 콘크리트
    case "gangnam": return "#2a2a2a"; // 도시 아스팔트
    default: return "#888";
  }
}

function Roads({ district }: { district: District }) {
  const isNight = district.id === "itaewon";

  return (
    <group>
      {/* 메인 도로 (남북) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[6, 100]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* 중앙선 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[0.3, 100]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* 횡단 도로 (동서) */}
      <mesh rotation={[-Math.PI / 2, Math.PI / 2, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[6, 100]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* 보조 도로들 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[25, 0.01, 0]}>
        <planeGeometry args={[4, 80]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-25, 0.01, 0]}>
        <planeGeometry args={[4, 80]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, Math.PI / 2, 0]} position={[0, 0.01, 25]}>
        <planeGeometry args={[4, 80]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, Math.PI / 2, 0]} position={[0, 0.01, -25]}>
        <planeGeometry args={[4, 80]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      {/* 이태원 네온 도로 */}
      {isNight && (
        <>
          <mesh position={[-3.5, 0.1, 0]}>
            <boxGeometry args={[0.2, 0.15, 100]} />
            <meshStandardMaterial color="#FF1493" emissive="#FF1493" emissiveIntensity={2} />
          </mesh>
          <mesh position={[3.5, 0.1, 0]}>
            <boxGeometry args={[0.2, 0.15, 100]} />
            <meshStandardMaterial color="#00CED1" emissive="#00CED1" emissiveIntensity={2} />
          </mesh>
          {/* 가로등 */}
          {Array.from({ length: 8 }).map((_, i) => (
            <group key={`lamp-${i}`} position={[i % 2 === 0 ? -4 : 4, 0, -35 + i * 10]}>
              <mesh position={[0, 4, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 8]} />
                <meshStandardMaterial color="#333" />
              </mesh>
              <pointLight position={[0, 7, 0]} color={i % 2 === 0 ? "#FF69B4" : "#00CED1"} intensity={15} distance={12} />
            </group>
          ))}
        </>
      )}

      {/* 강남 가로등 */}
      {district.id === "gangnam" && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <group key={`gangnam-lamp-${i}`} position={[i % 2 === 0 ? -4 : 4, 0, -25 + i * 10]}>
              <mesh position={[0, 5, 0]}>
                <cylinderGeometry args={[0.08, 0.1, 10]} />
                <meshStandardMaterial color="#555" metalness={0.8} />
              </mesh>
              <mesh position={[i % 2 === 0 ? 1 : -1, 9.5, 0]}>
                <boxGeometry args={[2, 0.3, 0.8]} />
                <meshStandardMaterial color="#666" />
              </mesh>
            </group>
          ))}
        </>
      )}
    </group>
  );
}

function RealBuildings({ district }: { district: District }) {
  const center = CENTER_COORDS[district.id as keyof typeof CENTER_COORDS];
  const locations = REAL_LOCATIONS[district.id] || [];

  // 지역별 스케일 조정 (좌표 대비 간격)
  const getScale = (districtId: string) => {
    switch (districtId) {
      case "gyeongbokgung": return 0.8; // 궁궐의 실제 배치감을 위해 스케일 조정
      case "itaewon": return 0.25;
      case "hongdae": return 0.35; // 건물 크기가 커졌으므로 간격 스케일 조정
      case "gangnam": return 0.22;
      default: return 0.3;
    }
  };

  const scale = getScale(district.id);

  return (
    <group renderOrder={100}>
      {locations.map((loc, i) => {
        const pos = latLngToMeters(loc.lat, loc.lng, center.lat, center.lng);
        const x = pos.x * scale;
        const z = pos.z * scale;

        // 지역별 크기 배율 (경복궁은 1.0으로 실제 비율 유지)
        const sizeMult = district.id === "gyeongbokgung" ? 1.0 : 1.5;

        return (
          <Building
            key={i}
            position={[x, 0, z]}
            size={[
              (loc.width || 15) * sizeMult,
              (loc.height || 15) * sizeMult,
              (loc.depth || 15) * sizeMult,
            ]}
            type={loc.type}
            name={loc.name}
            districtId={district.id}
          />
        );
      })}
    </group>
  );
}

interface BuildingProps {
  position: [number, number, number];
  size: [number, number, number];
  type: string;
  name: string;
  districtId: string;
}

function Building({ position, size, type, name, districtId }: BuildingProps) {
  const [hovered, setHovered] = useState(false);
  const [width, height, depth] = size;

  // 건물 타입별 스타일
  const style = useMemo(() => {
    const isHongdae = districtId === "hongdae";
    const hongdaeColors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#AA96DA", "#F38181", "#A8E6CF", "#FFD3B6", "#D4A5A5", "#92A8D1", "#F7CAC9"];

    switch (type) {
      case "palace":
      case "palace_double":
      case "gate":
      case "gate_double":
      case "pavilion":
      case "pavilion_water":
      case "pavilion_hex":
        return { color: "#8B4513", roof: "#1a1a1a", isTraditional: true };
      case "corridor":
        return { color: "#a0522d", roof: "#2d2d2d", isTraditional: true };
      case "skyscraper":
        return { color: "#4a5568", roof: "#333", isTraditional: false };
      case "club":
        return { color: "#1a1a2e", roof: "#FF1493", isTraditional: false, isNeon: true };
      case "art":
      case "cafe":
      case "shop":
      case "restaurant":
        const colorIdx = Math.abs(name.split('').reduce((a,b)=>a+b.charCodeAt(0), 0)) % (isHongdae ? hongdaeColors.length : 4);
        return { 
          color: isHongdae ? hongdaeColors[colorIdx] : ["#9370DB", "#FF6B6B", "#4ECDC4", "#FFE66D"][colorIdx], 
          roof: "#333", 
          isTraditional: false,
          hasDetail: isHongdae
        };
      case "hotel":
        return { color: "#2c3e50", roof: "#1a252f", isTraditional: false };
      default:
        return { color: isHongdae ? "#e2e8f0" : "#666", roof: "#444", isTraditional: false };
    }
  }, [type, name, districtId]);

  // 전통 건물 (경복궁) - 화려한 전통 양식
  if (style.isTraditional) {
    const isPalace = type === "palace" || type === "palace_double";
    const isDouble = type === "palace_double" || type === "gate_double";
    const isGate = type === "gate" || type === "gate_double";
    const isPavilion = type === "pavilion" || type === "pavilion_water" || type === "pavilion_hex";
    const isWater = type === "pavilion_water";
    const isHex = type === "pavilion_hex";
    const isCorridor = type === "corridor";

    // 단청 및 전통 색상 강화 (이미지 기반 고발색 팔레트)
    const dancheongGreen = "#00a86b"; // 선명한 에메랄드/비취색
    const dancheongRed = "#ef4444"; 
    const dancheongBlue = "#3b82f6";
    const dancheongYellow = "#fbbf24";
    const columnRed = "#b91c1c"; // 강렬한 붉은 기둥
    const wallTerracotta = "#da725c"; // 따뜻한 주황빛 벽면
    const stoneColor = "#a8a29e"; // 기단 석재
    const giwaColor = "#262626"; // 짙은 기와

    return (
      <group position={position}>
        {/* 기단 (월대) - 물 위 정자는 돌기둥만, 나머지는 석축 베이스 */}
        {isWater ? (
          // 경회루 돌기둥
          <group position={[0, 4, 0]}>
            {Array.from({ length: 24 }).map((_, i) => (
              <mesh key={i} position={[(i % 6 - 2.5) * (width / 5), -2, (Math.floor(i / 6) - 1.5) * (depth / 3)]}>
                <boxGeometry args={[1.5, 8, 1.5]} />
                <meshStandardMaterial color={stoneColor} />
              </mesh>
            ))}
          </group>
        ) : (
          <>
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
              <boxGeometry args={[width + 4, 0.8, depth + 4]} />
              <meshStandardMaterial color={stoneColor} />
            </mesh>
            <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width + 2, 0.8, depth + 2]} />
              <meshStandardMaterial color="#a8a29e" />
            </mesh>
            {/* 기단 계단 */}
            {!isCorridor && (
              <mesh position={[0, 0.8, depth / 2 + 2.5]}>
                <boxGeometry args={[width * 0.4, 1.6, 1.5]} />
                <meshStandardMaterial color="#a8a29e" />
              </mesh>
            )}
          </>
        )}

        {/* 기둥들 (이미지 기반 강렬한 레드) */}
        {!isCorridor && Array.from({ length: Math.ceil(width / 5) }).map((_, i) => (
          <group key={`col-${i}`}>
            {/* 전면 기둥 */}
            <mesh position={[-width / 2 + 1 + i * 5, height / 2 + (isWater ? 8 : 1.2), depth / 2 - 1.2]} castShadow>
              <cylinderGeometry args={[0.7, 0.7, height, 12]} />
              <meshStandardMaterial color={columnRed} roughness={0.4} />
            </mesh>
            {/* 후면 기둥 */}
            <mesh position={[-width / 2 + 1 + i * 5, height / 2 + (isWater ? 8 : 1.2), -depth / 2 + 1.2]} castShadow>
              <cylinderGeometry args={[0.7, 0.7, height, 12]} />
              <meshStandardMaterial color={columnRed} roughness={0.4} />
            </mesh>
          </group>
        ))}

        {/* 본체 벽면 (따뜻한 테라코타 색상) */}
        <mesh position={[0, height / 2 + (isWater ? 8 : 1.6), 0]} castShadow receiveShadow>
          <boxGeometry args={[isHex ? width * 0.8 : width - 0.4, height - 0.4, isHex ? depth * 0.8 : depth - 0.4]} />
          <meshStandardMaterial color={wallTerracotta} roughness={0.8} />
        </mesh>

        {/* 2층 구조 (중층 건물) */}
        {isDouble && (
          <group position={[0, height + (isWater ? 8 : 1.6), 0]}>
            {/* 1층과 2층 사이 처마 */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[width + 4, 0.6, depth + 3]} />
              <meshStandardMaterial color={dancheongGreen} />
            </mesh>
            {/* 2층 몸체 */}
            <mesh position={[0, height * 0.4, 0]} castShadow>
              <boxGeometry args={[width * 0.7, height * 0.8, depth * 0.7]} />
              <meshStandardMaterial color="#d6d3d1" />
            </mesh>
          </group>
        )}

        {/* 문/창살 패턴 (어두운 나무) */}
        {!isCorridor && Array.from({ length: Math.floor(width / 4) }).map((_, i) => (
          <mesh key={`door-${i}`} position={[-width / 2 + 2 + i * 4, height / 2 + (isWater ? 8 : 1), depth / 2 + 0.31]}>
            <planeGeometry args={[2.5, height - 2]} />
            <meshStandardMaterial color="#3d1a11" />
          </mesh>
        ))}

        {/* 처마 (지붕 밑) */}
        <mesh position={[0, height + (isWater ? 8 : 1.5), 0]}>
          <boxGeometry args={[width + 4, 0.6, depth + 3]} />
          <meshStandardMaterial color={dancheongGreen} />
        </mesh>

        {/* 단청 장식 - 전면 */}
        <group position={[0, height + 1.2, depth / 2 + 2.4]}>
          {/* 녹색 띠 */}
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[width + 3, 0.4, 0.15]} />
            <meshStandardMaterial color={dancheongGreen} />
          </mesh>
          {/* 빨간 띠 */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[width + 3, 0.3, 0.15]} />
            <meshStandardMaterial color={dancheongRed} />
          </mesh>
          {/* 파란 띠 */}
          <mesh position={[0, -0.25, 0]}>
            <boxGeometry args={[width + 3, 0.2, 0.15]} />
            <meshStandardMaterial color={dancheongBlue} />
          </mesh>
          {/* 황금 문양 포인트 */}
          {Array.from({ length: Math.floor(width / 4) }).map((_, i) => (
            <mesh key={`gold-${i}`} position={[-width / 2 + 2 + i * 4, 0.3, 0.1]}>
              <circleGeometry args={[0.3, 8]} />
              <meshStandardMaterial color={dancheongYellow} emissive={dancheongYellow} emissiveIntensity={0.3} />
            </mesh>
          ))}
        </group>

        {/* 단청 - 측면 */}
        {[1, -1].map((side) => (
          <group key={`side-${side}`} position={[side * (width / 2 + 2), height + 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
            <mesh position={[0, 0.3, 0]}><boxGeometry args={[depth + 3, 0.4, 0.15]} /><meshStandardMaterial color={dancheongGreen} /></mesh>
            <mesh position={[0, 0, 0]}><boxGeometry args={[depth + 3, 0.3, 0.15]} /><meshStandardMaterial color={dancheongRed} /></mesh>
            <mesh position={[0, -0.25, 0]}><boxGeometry args={[depth + 3, 0.2, 0.15]} /><meshStandardMaterial color={dancheongBlue} /></mesh>
          </group>
        ))}

        {/* 지붕 */}
        <mesh position={[0, (isDouble ? height * 1.5 : height) + (isWater ? 8 : 2.8), 0]} castShadow>
          <boxGeometry args={[width + 5, 1.8, depth + 4]} />
          <meshStandardMaterial color="#262626" roughness={0.9} />
        </mesh>

        {/* 용마루 (지붕 꼭대기) */}
        {!isCorridor && (
          <group position={[0, height + 4, 0]}>
            {/* 팔작지붕 형태 */}
            <mesh rotation={[0, 0, 0]} castShadow>
              <boxGeometry args={[width + 3, 0.8, 2]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            {/* 양 끝 치미/취두 장식 */}
            <mesh position={[width / 2 + 1, 0.8, 0]}>
              <coneGeometry args={[0.5, 1.5, 4]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[-width / 2 - 1, 0.8, 0]}>
              <coneGeometry args={[0.5, 1.5, 4]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            {/* 용마루 문양 */}
            {(isPalace || isGate) && (
              <mesh position={[0, 1, 0]}>
                <sphereGeometry args={[0.6, 8, 8]} />
                <meshStandardMaterial color={dancheongYellow} emissive={dancheongYellow} emissiveIntensity={0.5} />
              </mesh>
            )}
          </group>
        )}

        {/* 정자/누각 추가 장식 */}
        {isPavilion && (
          <>
            {/* 난간 */}
            <mesh position={[0, 2, 0]}>
              <boxGeometry args={[width + 3, 0.1, depth + 3]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {Array.from({ length: 8 }).map((_, i) => (
              <mesh key={`rail-${i}`} position={[Math.cos(i * Math.PI / 4) * (width / 2 + 1), 2.5, Math.sin(i * Math.PI / 4) * (depth / 2 + 1)]}>
                <boxGeometry args={[0.2, 1, 0.2]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
            ))}
          </>
        )}

        {/* 이름 라벨 */}
        <Html position={[0, (isDouble ? height * 1.8 : height) + (isWater ? 12 : 10), 0]} center>
          <div className="bg-gradient-to-b from-amber-900/90 to-stone-900/90 px-3 py-1.5 rounded text-white text-xs whitespace-nowrap border border-yellow-600/50 shadow-lg">
            <span className="text-yellow-500">{isWater ? "🌊" : "🏯"}</span> {name}
          </div>
        </Html>
      </group>
    );
  }

  // 고층 빌딩 (현대적 스타일)
  if (type === "skyscraper") {
    const buildingVariant = name.length % 4; // 빌딩 디자인 변형
    const glassColors = ["#1a3a5c", "#1e3a4c", "#2a4a5c", "#1a2a3c"];
    const glassColor = glassColors[buildingVariant];
    const accentColors = ["#00d4ff", "#00ff88", "#ff6b35", "#a855f7"];
    const accentColor = accentColors[buildingVariant];

    return (
      <group position={position}>
        {/* 베이스/로비 (1층) */}
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[width + 2, 3, depth + 2]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* 로비 유리 */}
        <mesh position={[0, 1.5, depth / 2 + 1.1]}>
          <planeGeometry args={[width, 2.5]} />
          <meshStandardMaterial color="#88ccff" emissive="#88ccff" emissiveIntensity={0.5} transparent opacity={0.6} />
        </mesh>

        {/* 메인 빌딩 */}
        <mesh
          position={[0, height / 2 + 3, 0]}
          castShadow
          receiveShadow
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[width, height - 3, depth]} />
          <meshStandardMaterial
            color={hovered ? "#3b82f6" : glassColor}
            metalness={0.95}
            roughness={0.05}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* 유리 커튼월 - 전면 */}
        {Array.from({ length: Math.floor((height - 3) / 3) }).map((_, i) => (
          <group key={`front-${i}`}>
            <mesh position={[0, 5 + i * 3, depth / 2 + 0.1]}>
              <planeGeometry args={[width - 0.5, 2.2]} />
              <meshStandardMaterial
                color="#a8d8ff"
                emissive="#a8d8ff"
                emissiveIntensity={0.4}
                transparent
                opacity={0.7}
                metalness={0.8}
              />
            </mesh>
            {/* 수평 프레임 */}
            <mesh position={[0, 3.8 + i * 3, depth / 2 + 0.15]}>
              <boxGeometry args={[width, 0.15, 0.1]} />
              <meshStandardMaterial color="#333" metalness={0.9} />
            </mesh>
          </group>
        ))}

        {/* 유리 커튼월 - 측면 */}
        {Array.from({ length: Math.floor((height - 3) / 3) }).map((_, i) => (
          <group key={`side-${i}`}>
            <mesh position={[width / 2 + 0.1, 5 + i * 3, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[depth - 0.5, 2.2]} />
              <meshStandardMaterial color="#a8d8ff" emissive="#a8d8ff" emissiveIntensity={0.3} transparent opacity={0.6} metalness={0.8} />
            </mesh>
            <mesh position={[-width / 2 - 0.1, 5 + i * 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[depth - 0.5, 2.2]} />
              <meshStandardMaterial color="#a8d8ff" emissive="#a8d8ff" emissiveIntensity={0.3} transparent opacity={0.6} metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* 수직 프레임 라인 */}
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh key={`vframe-${i}`} position={[-width / 2 + (i + 1) * width / 5, height / 2 + 3, depth / 2 + 0.15]}>
            <boxGeometry args={[0.1, height - 3, 0.1]} />
            <meshStandardMaterial color="#222" metalness={0.9} />
          </mesh>
        ))}

        {/* 옥상 구조물 */}
        <group position={[0, height + 3, 0]}>
          {/* 헬리패드 또는 기계실 */}
          {buildingVariant === 0 && (
            <>
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[width * 0.3, width * 0.3, 0.3, 32]} />
                <meshStandardMaterial color="#333" />
              </mesh>
              <mesh position={[0, 0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[width * 0.1, width * 0.25, 32]} />
                <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
              </mesh>
            </>
          )}
          {/* 안테나/첨탑 */}
          {buildingVariant === 1 && (
            <mesh position={[0, 4, 0]}>
              <cylinderGeometry args={[0.2, 0.5, 8, 8]} />
              <meshStandardMaterial color="#666" metalness={0.9} />
            </mesh>
          )}
          {/* LED 스크린 */}
          {buildingVariant === 2 && (
            <mesh position={[0, 2, depth / 2 + 0.5]}>
              <planeGeometry args={[width * 0.6, 3]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2} />
            </mesh>
          )}
          {/* 옥상 정원 */}
          {buildingVariant === 3 && (
            <mesh position={[0, 0.3, 0]}>
              <boxGeometry args={[width * 0.8, 0.5, depth * 0.8]} />
              <meshStandardMaterial color="#2d5a27" />
            </mesh>
          )}
        </group>

        {/* 액센트 LED 라인 */}
        <mesh position={[0, height + 2.5, depth / 2 + 0.2]}>
          <boxGeometry args={[width + 0.5, 0.2, 0.1]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[0, 3.2, depth / 2 + 1.15]}>
          <boxGeometry args={[width + 2, 0.15, 0.1]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1} />
        </mesh>

        {/* 이름 라벨 */}
        <Html position={[0, height + 8, 0]} center>
          <div className="bg-gradient-to-r from-blue-900/90 to-slate-900/90 px-3 py-1.5 rounded-lg text-white text-xs whitespace-nowrap border border-blue-400/30 shadow-lg backdrop-blur">
            <span className="text-blue-400">🏢</span> {name}
          </div>
        </Html>
      </group>
    );
  }

  // 클럽/네온 건물
  if (style.isNeon) {
    const neonColors = ["#FF1493", "#00CED1", "#FFD700", "#FF4500"];
    const neonColor = neonColors[name.length % neonColors.length];

    return (
      <group position={position}>
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        {/* 네온 사인 */}
        <mesh position={[0, height - 1, depth / 2 + 0.2]}>
          <boxGeometry args={[width * 0.8, 1.5, 0.2]} />
          <meshStandardMaterial
            color={neonColor}
            emissive={neonColor}
            emissiveIntensity={3}
          />
        </mesh>

        <pointLight
          position={[0, height / 2, depth / 2 + 2]}
          color={neonColor}
          intensity={20}
          distance={15}
        />

        {/* 이름 라벨 - 항상 표시 */}
        <Html position={[0, height + 3, 0]} center>
          <div
            className="px-2 py-1 rounded text-white text-xs whitespace-nowrap font-bold"
            style={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              borderColor: neonColor,
              borderWidth: '1px',
              borderStyle: 'solid',
              textShadow: `0 0 10px ${neonColor}`
            }}
          >
            🎵 {name}
          </div>
        </Html>
      </group>
    );
  }

  // 기본 건물
  const getEmojiForType = (t: string) => {
    switch (t) {
      case "hotel": return "🏨";
      case "restaurant": return "🍴";
      case "shop": return "🛍️";
      case "cafe": return "☕";
      case "art": return "🎨";
      case "plaza": return "🌳";
      case "street": return "🛣️";
      case "stage": return "🎤";
      case "station": return "🚇";
      default: return "🏢";
    }
  };

  return (
    <group position={position}>
      {/* 건물 본체 */}
      <mesh
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial 
          color={hovered ? "#fff" : style.color} 
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* 창문 (Windows) - 디테일이 필요한 건물에 추가 */}
      {!style.isNeon && height > 5 && (
        <group position={[0, height / 2, 0]}>
          {/* 전면 창문들 */}
          {Array.from({ length: Math.floor(height / 4) }).map((_, hIdx) => (
            <group key={`win-row-${hIdx}`} position={[0, -height / 2 + 2.5 + hIdx * 4, depth / 2 + 0.1]}>
              {Array.from({ length: Math.floor(width / 3) }).map((_, wIdx) => (
                <mesh key={`win-${hIdx}-${wIdx}`} position={[-width / 2 + 1.5 + wIdx * 3, 0, 0]}>
                  <planeGeometry args={[1.5, 2]} />
                  <meshStandardMaterial color="#1a3a5c" emissive="#1a3a5c" emissiveIntensity={0.2} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}

      {/* 간판 (Signboards) */}
      {(style.hasDetail || style.isNeon) && (
        <group position={[width / 2 + 0.2, height * 0.7, depth / 2 - 2]}>
          <mesh castShadow>
            <boxGeometry args={[0.4, height * 0.2, 1.5]} />
            <meshStandardMaterial color={style.isNeon ? "#FF1493" : style.color} />
          </mesh>
          <pointLight color={style.isNeon ? "#FF1493" : "#ffffff"} intensity={style.isNeon ? 10 : 2} distance={5} />
        </group>
      )}

      {/* 옥상 구조물 (Rooftop details) */}
      <group position={[0, height + 0.1, 0]}>
        <mesh position={[width * 0.2, 0.5, depth * 0.2]} castShadow>
          <boxGeometry args={[width * 0.3, 1, depth * 0.3]} />
          <meshStandardMaterial color="#888" />
        </mesh>
        <mesh position={[-width * 0.2, 0.3, -depth * 0.1]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 1.5, 8]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      </group>

      {/* 이름 라벨 */}
      <Html position={[0, height + 3, 0]} center>
        <div 
          className="px-2 py-1 rounded text-white text-xs whitespace-nowrap font-bold shadow-xl backdrop-blur-sm"
          style={{
            backgroundColor: style.isNeon ? 'rgba(255, 20, 147, 0.8)' : 'rgba(0,0,0,0.7)',
            border: `1px solid ${style.color}`,
            textShadow: style.isNeon ? '0 0 8px #FF1493' : 'none'
          }}
        >
          {getEmojiForType(type)} {name}
        </div>
      </Html>
    </group>
  );
}

// 이태원 거리 장식 (최적화 버전)
function ItaewonDecorations() {
  const lanternColors = [
    "#FF4444", "#44FF44", "#4444FF", "#AA44FF",
    "#FF8844", "#FFFF44", "#FF44AA",
  ];
  const wireColors = ["#DDDDFF", "#FFFFFF", "#AAAAFF"];

  const lanterns = useMemo(() => {
    const items: Array<{
      position: [number, number, number];
      color: string;
      type: "teardrop" | "sphere" | "wire" | "diamond";
      scale: number;
    }> = [];

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const x = -20 + col * 10;
        const z = -15 + row * 10;
        const y = 12 + (row + col) % 3 * 2;

        const typeIdx = (row + col) % 4;
        const types: Array<"teardrop" | "sphere" | "wire" | "diamond"> = ["teardrop", "sphere", "wire", "diamond"];
        const type = types[typeIdx];
        const color = type === "wire"
          ? wireColors[(row + col) % wireColors.length]
          : lanternColors[(row + col) % lanternColors.length];

        items.push({ position: [x, y, z], color, type, scale: 0.7 + (row % 2) * 0.3 });
      }
    }
    return items;
  }, []);

  const stringLights = useMemo(() => {
    const lights: Array<{ position: [number, number, number]; color: string }>[] = [];
    for (let line = 0; line < 3; line++) {
      const lineZ = -20 + line * 15;
      const lineY = 10;
      const bulbs: Array<{ position: [number, number, number]; color: string }> = [];
      for (let i = 0; i < 10; i++) {
        const x = -25 + i * 5.5;
        const sag = Math.pow((i - 4.5) / 4.5, 2) * 1.5;
        bulbs.push({ position: [x, lineY - sag, lineZ], color: lanternColors[i % lanternColors.length] });
      }
      lights.push(bulbs);
    }
    return lights;
  }, []);

  return (
    <group>
      {lanterns.map((lantern, i) => (
        <Lantern key={`lantern-${i}`} {...lantern} />
      ))}
      {stringLights.map((line, lineIdx) => (
        <group key={`string-${lineIdx}`}>
          {line.length > 1 && <StringLine points={line.map((l) => l.position)} color="#444444" />}
          {line.map((bulb, bulbIdx) => (
            <mesh key={`bulb-${lineIdx}-${bulbIdx}`} position={bulb.position}>
              <sphereGeometry args={[0.2, 6, 6]} />
              <meshStandardMaterial color={bulb.color} emissive={bulb.color} emissiveIntensity={3} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Lantern({ position, color, type, scale }: {
  position: [number, number, number]; color: string;
  type: "teardrop" | "sphere" | "wire" | "diamond"; scale: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.z = Math.sin(t * 0.5 + position[0] * 0.1) * 0.08;
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 3, 4]} />
        <meshBasicMaterial color="#333" />
      </mesh>
      {type === "teardrop" && (
        <group>
          <mesh><sphereGeometry args={[1, 12, 12]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.9} /></mesh>
          <mesh position={[0, 0.8, 0]}><coneGeometry args={[0.6, 0.8, 8]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.9} /></mesh>
        </group>
      )}
      {type === "sphere" && <mesh><sphereGeometry args={[0.9, 12, 12]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.85} /></mesh>}
      {type === "wire" && (
        <group>
          <mesh><octahedronGeometry args={[1, 0]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} wireframe /></mesh>
          <mesh><sphereGeometry args={[0.25, 6, 6]} /><meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={4} /></mesh>
        </group>
      )}
      {type === "diamond" && <mesh rotation={[0, 0, Math.PI]}><octahedronGeometry args={[0.8, 0]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.9} /></mesh>}
    </group>
  );
}

function StringLine({ points, color }: { points: [number, number, number][]; color: string }) {
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(points.flat()), 3));
    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color }));
  }, [points, color]);
  return <primitive object={line} />;
}

// 홍대 아트 장식
function HongdaeDecorations() {
  const artColors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#AA96DA", "#F38181"];

  return (
    <group>
      {/* 버스킹 스테이지 (업그레이드 버전) */}
      <group position={[-15, 0, -5]}>
        {/* 무대 바닥 (나무 데크 느낌) */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[10, 10.5, 0.8, 32]} />
          <meshStandardMaterial color="#4a3728" roughness={0.9} />
        </mesh>
        
        {/* 무대 네온 테두리 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.85, 0]}>
          <torusGeometry args={[10, 0.1, 16, 64]} />
          <meshStandardMaterial color="#00CED1" emissive="#00CED1" emissiveIntensity={2} />
        </mesh>

        {/* 대형 스피커 (좌우) */}
        {[[-7, 1.5, -4], [7, 1.5, -4]].map((pos, i) => (
          <group key={`speaker-${i}`} position={pos as [number, number, number]}>
            <mesh castShadow>
              <boxGeometry args={[1.5, 3, 1.5]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0, 0.5, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.5, 16]} />
              <meshBasicMaterial color="#333" />
            </mesh>
            <mesh position={[0, -0.5, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.6, 16]} />
              <meshBasicMaterial color="#333" />
            </mesh>
          </group>
        ))}

        {/* 앰프/모니터 스피커 (바닥) */}
        {[[-3, 0.7, 4], [3, 0.7, 4]].map((pos, i) => (
          <mesh key={`amp-${i}`} position={pos as [number, number, number]} rotation={[-0.5, 0, 0]}>
            <boxGeometry args={[1.2, 0.8, 1]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        ))}

        {/* 마이크 스탠드 */}
        <group position={[0, 0.8, 2]}>
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
            <meshStandardMaterial color="#888" metalness={0.9} />
          </mesh>
          <mesh position={[0, 4, 0.2]} rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0, 4.3, 0.5]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#aaa" metalness={1} />
          </mesh>
        </group>

        {/* 무대 조명 조절 */}
        <pointLight position={[0, 10, 5]} color="#fff" intensity={50} distance={30} />
      </group>

      {/* 컬러 깃발 배너 및 지탱 기둥 */}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`banner-group-${i}`}>
          {/* 배너 지탱 기둥 (얇은 폴) */}
          <mesh position={[-25 + i * 10, 5.5, 25]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 11, 8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[-25 + i * 10, 5.5, -25]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 11, 8]} />
            <meshStandardMaterial color="#333" />
          </mesh>

          {/* 연결 와이어 */}
          <mesh position={[-25 + i * 10, 11, 0]}>
            <boxGeometry args={[0.05, 0.05, 50]} />
            <meshBasicMaterial color="#333" />
          </mesh>

          {/* 깃발들 */}
          {Array.from({ length: 8 }).map((_, j) => (
            <mesh key={j} position={[-25 + i * 10, 10.5, -20 + j * 6]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.8, 1.5, 3]} />
              <meshStandardMaterial color={artColors[(i + j) % artColors.length]} emissive={artColors[(i + j) % artColors.length]} emissiveIntensity={0.3} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 아트 프레임 */}
      {[{ pos: [-25, 0, 15], color: "#FF6B6B" }, { pos: [22, 0, -18], color: "#4ECDC4" }, { pos: [18, 0, 22], color: "#AA96DA" }].map((frame, i) => (
        <group key={`frame-${i}`} position={frame.pos as [number, number, number]}>
          <mesh position={[0, 3, 0]}><boxGeometry args={[4, 5, 0.3]} /><meshStandardMaterial color="#222" /></mesh>
          <mesh position={[0, 3, 0.2]}><planeGeometry args={[3.4, 4.4]} /><meshStandardMaterial color={frame.color} emissive={frame.color} emissiveIntensity={0.5} /></mesh>
          <mesh position={[0, 0.25, 0]}><boxGeometry args={[1.5, 0.5, 1.5]} /><meshStandardMaterial color="#444" /></mesh>
        </group>
      ))}

      {/* 네온 사인 */}
      <group position={[0, 18, 0]}>
        <Text fontSize={4} color="#FFE66D" anchorX="center" anchorY="middle" outlineWidth={0.15} outlineColor="#000">
          HONGDAE
          <meshStandardMaterial color="#FFE66D" emissive="#FFE66D" emissiveIntensity={2} />
        </Text>
      </group>

      {/* 컬러 바닥 타일 */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={`tile-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-22 + i * 5, 0.05, 5]}>
          <planeGeometry args={[4, 4]} /><meshStandardMaterial color={artColors[i % artColors.length]} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* 풍선 */}
      {[[-15, 12, 10], [10, 14, -15], [-20, 13, -10], [15, 11, 15]].map((pos, i) => (
        <BalloonCluster key={`balloon-${i}`} position={pos as [number, number, number]} colors={[artColors[i % 5], artColors[(i + 1) % 5], artColors[(i + 2) % 5]]} />
      ))}
    </group>
  );
}

function BalloonCluster({ position, colors }: { position: [number, number, number]; colors: string[] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.3;
  });

  return (
    <group ref={ref} position={position}>
      {colors.map((color, i) => (
        <group key={i} position={[(i - 1) * 1.2, i * 0.5, 0]}>
          <mesh><sphereGeometry args={[0.8, 12, 12]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} /></mesh>
          <mesh position={[0, -2, 0]}><cylinderGeometry args={[0.02, 0.02, 3, 4]} /><meshBasicMaterial color="#888" /></mesh>
        </group>
      ))}
    </group>
  );
}

function CoordinateInfo({ district }: { district: District }) {
  const center = CENTER_COORDS[district.id as keyof typeof CENTER_COORDS];

  return (
    <Html position={[0, 0.5, -80]} center>
      <div className="bg-black/60 px-3 py-1 rounded text-white text-xs">
        중심 좌표: {center?.lat.toFixed(6)}, {center?.lng.toFixed(6)}
      </div>
    </Html>
  );
}

// 홍대 NPC들 배치
function HongdaeNPCs() {
  const npcCount = 18;
  const positions = useMemo(() => {
    return Array.from({ length: npcCount }).map((_, i) => {
      // 8명은 무대 주변에 관객으로 배치
      if (i < 8) {
        const angle = (i / 8) * Math.PI + Math.PI * 0.5; // 무대 전면 반원
        const dist = 14 + Math.random() * 4;
        return {
          pos: [-15 + Math.cos(angle) * dist, 0.4, -5 + Math.sin(angle) * dist] as [number, number, number],
          color: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#AA96DA", "#F38181"][Math.floor(Math.random() * 5)],
          offset: Math.random() * Math.PI * 2,
          rotation: angle + Math.PI // 무대를 바라보게 함
        };
      }
      // 나머지는 길거리에 자유롭게 배치
      return {
        pos: [(Math.random() - 0.5) * 120, 0.4, (Math.random() - 0.5) * 80] as [number, number, number],
        color: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#AA96DA", "#F38181"][Math.floor(Math.random() * 5)],
        offset: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2
      };
    });
  }, []);

  return (
    <group>
      {positions.map((npc, i) => (
        <NPC key={`npc-${i}`} position={npc.pos} color={npc.color} offset={npc.offset} rotationY={npc.rotation} />
      ))}
    </group>
  );
}

// 개별 NPC 컴포넌트
function NPC({ position, color, offset, rotationY = 0 }: { position: [number, number, number]; color: string; offset: number; rotationY?: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime + offset;
    ref.current.position.y = position[1] + Math.sin(t * 3) * 0.1;
    ref.current.rotation.y = rotationY + Math.sin(t * 0.5) * 0.1;
  });

  return (
    <group ref={ref} position={position} scale={0.45}>
      {/* 바지 레이어 */}
      <mesh castShadow>
        <capsuleGeometry args={[1, 1.2, 8, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* 상의/셔츠 레이어 */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[1.1, 1.1, 1.6, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* 머리 */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[1.1, 16, 16]} />
        <meshStandardMaterial color="#FFE4B5" />
      </mesh>
    </group>
  );
}

function Mascot({
  district,
  onDragChange,
}: {
  district: District;
  onDragChange: (dragging: boolean) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<[number, number, number]>(
    district.id === "gyeongbokgung" ? [0, 2, 40] : [0, 2, 20]
  );
  const { camera, raycaster, pointer } = useThree();

  useCursor(isDragging);

  const onPointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    onDragChange(true);
  };

  const onPointerMove = (e: any) => {
    if (!isDragging) return;
    e.stopPropagation();

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -2);
    const intersection = new THREE.Vector3();
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(plane, intersection);

    if (intersection) {
      setPosition([intersection.x, 2, intersection.z]);
    }
  };

  const onPointerUp = () => {
    setIsDragging(false);
    onDragChange(false);
  };

  useFrame((state) => {
    if (!ref.current || isDragging) return;
    const t = state.clock.elapsedTime;
    // 부유 효과 최소화 (땅에 닿아있는 느낌)
    ref.current.position.y = position[1] + Math.sin(t * 2) * 0.2;

    if (district.id === "itaewon") {
      ref.current.rotation.y = Math.sin(t * 4) * 0.3;
    } else {
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
      scale={1.5}
      renderOrder={999}
    >
      <mesh visible={false}>
        <sphereGeometry args={[4]} />
      </mesh>

      {/* 바지 레이어 */}
      <mesh castShadow>
        <capsuleGeometry args={[1.2, 1.2, 12, 24]} />
        <meshStandardMaterial color="#2d3436" depthTest={false} transparent />
      </mesh>

      {/* 상의/재킷 레이어 */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[1.3, 1.3, 2.2, 24]} />
        <meshStandardMaterial 
          color={isDragging ? "#FFD700" : (district.id === "hongdae" ? "#AA96DA" : district.color)} 
          depthTest={false} 
          transparent 
        />
      </mesh>

      {/* 머리 */}
      <mesh position={[0, 2.8, 0]} castShadow>
        <sphereGeometry args={[1.5, 24, 24]} />
        <meshStandardMaterial color="#FFE4B5" depthTest={false} transparent />
      </mesh>

      {/* 경복궁: 갓 */}
      {district.id === "gyeongbokgung" && (
        <group position={[0, 4.2, 0]}>
          <mesh>
            <cylinderGeometry args={[0.8, 0.6, 0.8, 24]} />
            <meshStandardMaterial color="#1C1C1C" />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[2.2, 2.2, 0.1, 24]} />
            <meshStandardMaterial color="#1C1C1C" />
          </mesh>
        </group>
      )}

      {/* 홍대: 베레모 */}
      {district.id === "hongdae" && (
        <group position={[0, 4, 0.2]}>
          <mesh rotation={[0.2, 0, 0.1]}>
            <sphereGeometry args={[1.2, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#FF1493" />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.15]} />
            <meshStandardMaterial color="#FF1493" />
          </mesh>
        </group>
      )}

      {/* 이태원: DJ 헤드폰 */}
      {district.id === "itaewon" && (
        <group position={[0, 3.1, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[1.6, 0.15, 16, 32, Math.PI]} />
            <meshStandardMaterial color="#1C1C1C" metalness={0.8} roughness={0.2} depthTest={false} transparent />
          </mesh>
          <mesh position={[-1.6, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.5, 0.5, 0.3, 24]} />
            <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={0.5} depthTest={false} transparent />
          </mesh>
          <mesh position={[1.6, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.5, 0.5, 0.3, 24]} />
            <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={0.5} depthTest={false} transparent />
          </mesh>
        </group>
      )}

      {/* 강남: 선글라스 */}
      {district.id === "gangnam" && (
        <group position={[0, 2.9, 1.3]}>
          <mesh>
            <boxGeometry args={[2, 0.1, 0.1]} />
            <meshStandardMaterial color="#1C1C1C" depthTest={false} transparent />
          </mesh>
          <mesh position={[-0.6, -0.15, 0]}>
            <boxGeometry args={[0.7, 0.5, 0.1]} />
            <meshStandardMaterial color="#1C1C1C" metalness={0.9} roughness={0.1} depthTest={false} transparent />
          </mesh>
          <mesh position={[0.6, -0.15, 0]}>
            <boxGeometry args={[0.7, 0.5, 0.1]} />
            <meshStandardMaterial color="#1C1C1C" metalness={0.9} roughness={0.1} depthTest={false} transparent />
          </mesh>
        </group>
      )}

      {/* 눈 (강남은 선글라스로 가림) */}
      {district.id !== "gangnam" && (
        <>
          <mesh position={[-0.5, 2.7, 1.2]}>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial color="#000" depthTest={false} transparent />
          </mesh>
          <mesh position={[0.5, 2.7, 1.2]}>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial color="#000" depthTest={false} transparent />
          </mesh>
        </>
      )}

      {/* 볼터치 */}
      <mesh position={[-1, 2.3, 1]}>
        <sphereGeometry args={[0.25]} />
        <meshStandardMaterial color="#FF6B6B" transparent opacity={0.6} depthTest={false} />
      </mesh>
      <mesh position={[1, 2.3, 1]}>
        <sphereGeometry args={[0.25]} />
        <meshStandardMaterial color="#FF6B6B" transparent opacity={0.6} depthTest={false} />
      </mesh>

      <Html position={[0, 5.5, 0]} center>
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 rounded-full text-white font-bold text-base whitespace-nowrap shadow-lg">
          {getMascotLabel(district.id)} {isDragging && "✨"}
        </div>
      </Html>
    </group>
  );
}

function getMascotLabel(districtId: string): string {
  switch (districtId) {
    case "gyeongbokgung":
      return "🎎 한복 버디";
    case "hongdae":
      return "🎨 아티스트 버디";
    case "itaewon":
      return "🎧 DJ 버디";
    case "gangnam":
      return "💼 셀럽 버디";
    default:
      return "🐥 버디";
  }
}
