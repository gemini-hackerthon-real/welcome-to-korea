# 서울 버드아이 (Seoul Bird's Eye) - 구현 가이드

Google Maps Bird's Eye View가 한국에서 작동하지 않아, 3D 모델링으로 대체한 서울 관광 가이드 앱입니다.

## 1. 프로젝트 설정

### 1.1 프로젝트 생성
```bash
npx create-next-app@14 seoul-birds-eye --typescript --tailwind --eslint --app --src-dir
cd seoul-birds-eye
```

### 1.2 패키지 설치
```bash
npm install three @react-three/fiber @react-three/drei @google/generative-ai
npm install -D @types/three
```

### 1.3 package.json
```json
{
  "name": "seoul-birds-eye",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "@react-three/drei": "^9.114.0",
    "@react-three/fiber": "^8.17.0",
    "next": "14.2.14",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "three": "^0.169.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/three": "^0.169.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.2"
  }
}
```

### 1.4 환경 변수 (.env)
```env
# Gemini API 키
GEMINI_API_KEY=your_gemini_api_key_here

# Google Maps API 키 (선택사항)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# 환경 설정
NODE_ENV=development
```

---

## 2. 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Gemini 챗봇 API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # 메인 페이지
└── components/
    └── Map3D/
        ├── SimpleMap.tsx         # 스타일 맵 (상세 3D 모델링)
        └── RealisticMap.tsx      # 실제 좌표 기반 맵
```

---

## 3. 핵심 컴포넌트

### 3.1 메인 페이지 (src/app/page.tsx)

```tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// 두 가지 맵 모드 (SSR 비활성화 필수)
const SimpleMap = dynamic(() => import("@/components/Map3D/SimpleMap"), {
  ssr: false,
  loading: () => <MapLoading />,
});

const RealisticMap = dynamic(() => import("@/components/Map3D/RealisticMap"), {
  ssr: false,
  loading: () => <MapLoading />,
});

function MapLoading() {
  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-bounce">🗺️</div>
        <p className="text-white">3D 맵 로딩 중...</p>
      </div>
    </div>
  );
}

// 4개 지역 정의
const DISTRICTS = [
  { id: "gyeongbokgung", name: "경복궁", icon: "🏯", color: "#8B4513" },
  { id: "itaewon", name: "이태원", icon: "🎉", color: "#FF1493" },
  { id: "hongdae", name: "홍대", icon: "🎨", color: "#9370DB" },
  { id: "gangnam", name: "강남", icon: "🏙️", color: "#4169E1" },
];

export default function Home() {
  const [currentDistrict, setCurrentDistrict] = useState(DISTRICTS[0]);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapMode, setMapMode] = useState<"simple" | "realistic">("simple");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, district: currentDistrict.name }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "죄송해요, 잠시 문제가 생겼어요!" }]);
    }
    setLoading(false);
  };

  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Map */}
      {mapMode === "simple" ? (
        <SimpleMap district={currentDistrict} />
      ) : (
        <RealisticMap district={currentDistrict} />
      )}

      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          서울 버드아이
        </h1>
        <p className="text-gray-400 text-sm">Seoul Bird's Eye</p>

        {/* 맵 모드 전환 */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setMapMode("simple")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mapMode === "simple"
                ? "bg-yellow-500 text-black"
                : "bg-white/10 text-gray-400 hover:bg-white/20"
            }`}
          >
            🎨 스타일 맵
          </button>
          <button
            onClick={() => setMapMode("realistic")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mapMode === "realistic"
                ? "bg-yellow-500 text-black"
                : "bg-white/10 text-gray-400 hover:bg-white/20"
            }`}
          >
            🗺️ 실제 지도 + 3D
          </button>
        </div>
      </div>

      {/* District Selector - 상단 중앙 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex gap-2 p-2 bg-black/70 backdrop-blur rounded-full">
          {DISTRICTS.map((d) => (
            <button
              key={d.id}
              onClick={() => setCurrentDistrict(d)}
              className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                currentDistrict.id === d.id
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
              }`}
              style={{
                background: currentDistrict.id === d.id ? d.color : "transparent",
              }}
            >
              <span>{d.icon}</span>
              <span className="font-medium">{d.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Button & Panel */}
      {/* ... 채팅 UI 구현 ... */}
    </main>
  );
}
```

---

### 3.2 Gemini 챗봇 API (src/app/api/chat/route.ts)

```tsx
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  const { message, district } = await request.json();

  // API 키가 없으면 mock 응답
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      reply: getMockResponse(message, district),
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
당신은 "버디"라는 귀여운 서울 여행 마스코트입니다.
현재 위치: ${district}

성격:
- 친근하고 유쾌함
- 이모지를 적절히 사용
- 답변은 2-3문장으로 간결하게

지역별 말투:
- 경복궁: 조금 더 품위있게, 옛말 살짝 섞어서
- 이태원: 신나고 활발하게, 영어 살짝 섞어서
- 홍대: 창의적이고 자유롭게
- 강남: 세련되고 프로페셔널하게

사용자 질문: ${message}
`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({
      reply: getMockResponse(message, district),
    });
  }
}

// API 키 없을 때 폴백 응답
function getMockResponse(message: string, district: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("맛집") || lower.includes("음식") || lower.includes("먹")) {
    switch (district) {
      case "경복궁": return "경복궁 근처엔 삼청동 수제비와 북촌 한정식이 유명하답니다! 🍜";
      case "이태원": return "이태원은 세계 음식 천국이야! 케밥, 타코, 버거 뭐든 있어~ 🌮";
      case "홍대": return "홍대는 떡볶이 골목이랑 연남동 브런치 카페 추천! 🥞";
      case "강남": return "강남역 맛집은 압구정 로데오 쪽 파인다이닝 추천드려요. 🍷";
    }
  }

  // 기본 응답
  switch (district) {
    case "경복궁": return "경복궁에 오신 걸 환영하오~ 무엇이든 물어보시게나! 🏯";
    case "이태원": return "Hey~ 이태원에서 뭐든 물어봐! 내가 다 알려줄게! 🎉";
    case "홍대": return "홍대 버디야~ 궁금한 거 있으면 편하게 물어봐! 🎨";
    case "강남": return "강남 가이드 버디입니다. 무엇을 도와드릴까요? 💼";
    default: return "안녕! 뭐든 물어봐~ 😊";
  }
}
```

---

### 3.3 실제 좌표 기반 3D 맵 (src/components/Map3D/RealisticMap.tsx)

#### 핵심 개념: GPS 좌표 → 3D 좌표 변환

```tsx
// 중심 좌표 (각 지역의 기준점)
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
```

#### 실제 건물 좌표 데이터

```tsx
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
    { name: "근정전", lat: 37.5796, lng: 126.9770, type: "palace", height: 15, width: 35, depth: 25 },
    { name: "광화문", lat: 37.5759, lng: 126.9769, type: "gate", height: 12, width: 40, depth: 15 },
    { name: "경회루", lat: 37.5808, lng: 126.9752, type: "pavilion", height: 10, width: 30, depth: 20 },
    // ... 더 많은 건물들
  ],
  itaewon: [
    { name: "해밀턴호텔", lat: 37.5343, lng: 126.9942, type: "hotel", height: 35, width: 25, depth: 20 },
    { name: "클럽 A", lat: 37.5350, lng: 126.9960, type: "club", height: 18, width: 12, depth: 12 },
    // ... 더 많은 건물들
  ],
  hongdae: [
    { name: "홍대놀이터", lat: 37.5563, lng: 126.9234, type: "plaza", height: 2, width: 30, depth: 30 },
    { name: "버스킹존", lat: 37.5560, lng: 126.9228, type: "stage", height: 3, width: 15, depth: 15 },
    // ... 더 많은 건물들
  ],
  gangnam: [
    { name: "강남역", lat: 37.4980, lng: 127.0276, type: "station", height: 8, width: 40, depth: 25 },
    { name: "GT타워", lat: 37.4985, lng: 127.0285, type: "skyscraper", height: 80, width: 25, depth: 25 },
    // ... 더 많은 건물들
  ],
};
```

#### 지역별 스케일 조정 (건물 밀집도)

```tsx
function RealBuildings({ district }: { district: District }) {
  const center = CENTER_COORDS[district.id as keyof typeof CENTER_COORDS];
  const locations = REAL_LOCATIONS[district.id] || [];

  // 지역별 스케일 조정 (건물 간격을 더 좁게)
  const getScale = (districtId: string) => {
    switch (districtId) {
      case "gyeongbokgung": return 0.35; // 궁궐은 좀 더 여유있게
      case "itaewon": return 0.25; // 밀집 상권
      case "hongdae": return 0.28; // 밀집 상권
      case "gangnam": return 0.22; // 고층빌딩 밀집
      default: return 0.3;
    }
  };

  const scale = getScale(district.id);

  return (
    <group>
      {locations.map((loc, i) => {
        const pos = latLngToMeters(loc.lat, loc.lng, center.lat, center.lng);
        const x = pos.x * scale;
        const z = pos.z * scale;

        return (
          <Building
            key={i}
            position={[x, 0, z]}
            size={[
              (loc.width || 15) * 0.5,
              (loc.height || 15) * 0.5,
              (loc.depth || 15) * 0.5,
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
```

#### 건물 타입별 렌더링

```tsx
function Building({ position, size, type, name, districtId }: BuildingProps) {
  const [width, height, depth] = size;

  // 건물 타입별 스타일
  const style = useMemo(() => {
    switch (type) {
      case "palace":
      case "gate":
      case "pavilion":
        return { color: "#8B4513", roof: "#1a1a1a", isTraditional: true };
      case "skyscraper":
        return { color: "#4a5568", roof: "#333", isTraditional: false };
      case "club":
        return { color: "#1a1a2e", roof: "#FF1493", isTraditional: false, isNeon: true };
      case "art":
      case "cafe":
        const colors = ["#9370DB", "#FF6347", "#00FA9A", "#FFB6C1"];
        return { color: colors[name.length % colors.length], roof: "#333", isTraditional: false };
      case "hotel":
        return { color: "#2c3e50", roof: "#1a252f", isTraditional: false };
      default:
        return { color: "#666", roof: "#444", isTraditional: false };
    }
  }, [type, name]);

  // 전통 건물 (경복궁)
  if (style.isTraditional) {
    return (
      <group position={position}>
        {/* 기단 */}
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[width + 3, 2, depth + 3]} />
          <meshStandardMaterial color="#d4c5a9" />
        </mesh>

        {/* 본체 */}
        <mesh position={[0, height / 2 + 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={style.color} />
        </mesh>

        {/* 지붕 */}
        <mesh position={[0, height + 2.5, 0]} castShadow>
          <boxGeometry args={[width + 4, 1, depth + 3]} />
          <meshStandardMaterial color={style.roof} />
        </mesh>

        {/* 단청 */}
        <mesh position={[0, height + 2, depth / 2 + 1.5]}>
          <boxGeometry args={[width + 2, 0.8, 0.2]} />
          <meshStandardMaterial color="#2d8a5e" />
        </mesh>

        {/* 이름 라벨 */}
        <Html position={[0, height + 6, 0]} center>
          <div className="bg-black/80 px-2 py-1 rounded text-white text-xs whitespace-nowrap border border-yellow-600">
            🏯 {name}
          </div>
        </Html>
      </group>
    );
  }

  // 고층 빌딩 (강남)
  if (type === "skyscraper") {
    return (
      <group position={position}>
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={style.color} metalness={0.8} roughness={0.2} />
        </mesh>

        {/* 창문 */}
        {Array.from({ length: Math.floor(height / 4) }).map((_, i) => (
          <mesh key={i} position={[0, 2 + i * 4, depth / 2 + 0.1]}>
            <planeGeometry args={[width - 1, 2.5]} />
            <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.3} />
          </mesh>
        ))}

        <Html position={[0, height + 3, 0]} center>
          <div className="bg-black/80 px-2 py-1 rounded text-white text-xs whitespace-nowrap border border-blue-400/50">
            🏢 {name}
          </div>
        </Html>
      </group>
    );
  }

  // 클럽/네온 건물 (이태원)
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
          <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={3} />
        </mesh>

        <pointLight position={[0, height / 2, depth / 2 + 2]} color={neonColor} intensity={20} distance={15} />

        <Html position={[0, height + 3, 0]} center>
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderColor: neonColor,
            borderWidth: '1px',
            textShadow: `0 0 10px ${neonColor}`
          }}>
            🎵 {name}
          </div>
        </Html>
      </group>
    );
  }

  // ... 기본 건물
}
```

#### 하늘/배경 설정

```tsx
import { Sky, Stars } from "@react-three/drei";

// Canvas 내부
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

function getSunPosition(districtId: string): [number, number, number] {
  switch (districtId) {
    case "gyeongbokgung": return [100, 80, 50]; // 높은 태양 (정오)
    case "hongdae": return [50, 20, 100]; // 낮은 태양 (석양)
    case "gangnam": return [80, 60, 30]; // 오후 태양
    default: return [100, 50, 50];
  }
}
```

---

### 3.4 드래그 가능한 마스코트

```tsx
function Mascot({ district, onDragChange }: { district: District; onDragChange: (dragging: boolean) => void }) {
  const ref = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<[number, number, number]>([0, 10, 20]);
  const { camera, raycaster, pointer } = useThree();

  useCursor(isDragging);

  const onPointerDown = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    onDragChange(true); // OrbitControls 비활성화
  };

  const onPointerMove = (e: any) => {
    if (!isDragging) return;
    e.stopPropagation();

    // 바닥 평면과의 교차점 계산
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -10);
    const intersection = new THREE.Vector3();
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(plane, intersection);

    if (intersection) {
      setPosition([intersection.x, 10, intersection.z]);
    }
  };

  const onPointerUp = () => {
    setIsDragging(false);
    onDragChange(false); // OrbitControls 다시 활성화
  };

  // 부유 애니메이션
  useFrame((state) => {
    if (!ref.current || isDragging) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = position[1] + Math.sin(t * 2) * 0.8;

    if (district.id === "itaewon") {
      ref.current.rotation.y = Math.sin(t * 4) * 0.3; // 신나게 춤추기
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
      scale={1.2}
    >
      {/* 투명 히트박스 (클릭 영역 확대) */}
      <mesh visible={false}>
        <sphereGeometry args={[4]} />
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
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[0.5, 2.7, 1.2]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="#000" />
      </mesh>

      {/* 볼터치 */}
      <mesh position={[-1, 2.3, 1]}>
        <sphereGeometry args={[0.25]} />
        <meshStandardMaterial color="#FF6B6B" transparent opacity={0.6} />
      </mesh>
      <mesh position={[1, 2.3, 1]}>
        <sphereGeometry args={[0.25]} />
        <meshStandardMaterial color="#FF6B6B" transparent opacity={0.6} />
      </mesh>

      {/* 이름표 */}
      <Html position={[0, 5, 0]} center>
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 rounded-full text-white font-bold text-sm">
          🐥 버디 {isDragging && "✨"}
        </div>
      </Html>
    </group>
  );
}
```

**중요**: 마스코트 드래그 시 `OrbitControls`를 비활성화해야 카메라가 같이 움직이지 않음:

```tsx
<OrbitControls enabled={!isDraggingMascot} />
```

---

### 3.5 SimpleMap - 상세 경복궁 모델링

SimpleMap은 각 지역을 더 상세하게 스타일화한 버전입니다. 경복궁의 경우:

```tsx
function GeunjeongjeonHall({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 2단 월대 (기단) */}
      <mesh position={[0, 1, 0]} receiveShadow castShadow>
        <boxGeometry args={[40, 2, 30]} />
        <meshStandardMaterial color="#d4c5a9" />
      </mesh>
      <mesh position={[0, 3, 0]} receiveShadow castShadow>
        <boxGeometry args={[32, 2, 24]} />
        <meshStandardMaterial color="#e8dcc8" />
      </mesh>

      {/* 기둥 그리드 */}
      <PillarGrid rows={5} cols={7} spacing={4} height={6} />

      {/* 창호 (격자 문) */}
      <WallWithDoors position={[0, 3, 9]} width={24} height={6} />

      {/* 팔작지붕 */}
      <PalaceRoof position={[0, 15.5, 0]} width={34} depth={26} />

      {/* 단청 장식 */}
      <mesh position={[0, -0.3, depth / 2 + 1.5]}>
        <boxGeometry args={[width + 2, 0.8, 0.3]} />
        <meshStandardMaterial color="#2d8a5e" /> {/* 녹색 */}
      </mesh>
      <mesh position={[0, -0.3, depth / 2 + 1.8]}>
        <boxGeometry args={[width + 2, 0.4, 0.1]} />
        <meshStandardMaterial color="#c41e3a" /> {/* 빨강 */}
      </mesh>
      <mesh position={[0, -0.6, depth / 2 + 1.8]}>
        <boxGeometry args={[width + 2, 0.3, 0.1]} />
        <meshStandardMaterial color="#4169E1" /> {/* 파랑 */}
      </mesh>

      {/* 현판 */}
      <Signboard position={[0, 13, 10]} text="勤政殿" />
    </group>
  );
}
```

---

## 4. Three.js / R3F 핵심 패턴

### 4.1 기본 Canvas 설정

```tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

<Canvas camera={{ position: [0, 60, 80], fov: 50 }} shadows>
  <color attach="background" args={["#87CEEB"]} />
  <fog attach="fog" args={["#87CEEB", 80, 200]} />

  <ambientLight intensity={0.5} />
  <directionalLight position={[50, 100, 50]} intensity={1.5} castShadow />

  <OrbitControls
    maxPolarAngle={Math.PI / 2.2}  // 수평선 아래로 못 내려감
    minPolarAngle={Math.PI / 8}     // 너무 위에서 못 봄
    minDistance={30}
    maxDistance={200}
  />

  {/* 3D 오브젝트들 */}
</Canvas>
```

### 4.2 mesh 기본 구조

```tsx
<mesh position={[x, y, z]} rotation={[rx, ry, rz]} castShadow receiveShadow>
  <boxGeometry args={[width, height, depth]} />
  <meshStandardMaterial color="#ff0000" metalness={0.5} roughness={0.3} />
</mesh>
```

### 4.3 HTML 오버레이

```tsx
import { Html } from "@react-three/drei";

<Html position={[0, 10, 0]} center>
  <div className="bg-black/80 px-2 py-1 rounded text-white">
    라벨 텍스트
  </div>
</Html>
```

### 4.4 애니메이션 (useFrame)

```tsx
import { useFrame } from "@react-three/fiber";

function AnimatedObject() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = Math.sin(t * 2) * 0.5; // 부유 효과
    ref.current.rotation.y += 0.01; // 회전
  });

  return (
    <mesh ref={ref}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  );
}
```

### 4.5 emissive (자체 발광)

```tsx
<meshStandardMaterial
  color="#FF1493"
  emissive="#FF1493"
  emissiveIntensity={3}
/>
```

---

## 5. 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일에 GEMINI_API_KEY 입력

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 http://localhost:3000 접속
```

---

## 6. 지역별 특징 요약

| 지역 | 시간대 | 배경색 | 특징 |
|------|--------|--------|------|
| 경복궁 | 낮 | #87CEEB (하늘색) | 전통 건축, 단청, 산 배경 |
| 이태원 | 밤 | #0a0612 (어두운 보라) | 네온, 별 배경, 클럽 조명 |
| 홍대 | 석양 | #f0e6d3 (노을색) | 다채로운 색상, 버스킹존 |
| 강남 | 낮 | #d4e5f7 (맑은 하늘) | 고층 빌딩, 유리창 반사 |

---

## 7. 커밋 컨벤션

```
feat: 새로운 기능
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅
refactor: 리팩토링
test: 테스트 추가/수정
chore: 빌드, 설정 변경

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

---

이 문서를 따라하면 동일한 프로젝트를 처음부터 구현할 수 있습니다.
