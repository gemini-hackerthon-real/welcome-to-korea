# 서울 버드아이 (Seoul Bird's Eye)

> Gemini 해커톤 프로젝트 기획서

## 핵심 컨셉

> "보안 규제로 막힌 한국의 Bird's Eye View를 Gemini AI로 창조적으로 재해석"

미국에서는 Google Maps의 Bird's Eye View가 가능하지만, 한국에서는 보안상의 이유로 제한됩니다. 이 프로젝트는 실제 위성/항공 사진 대신, **Gemini가 생성한 스타일라이즈된 3D 뷰**를 제공합니다.

단순 지도가 아닌 **문화적 경험이 담긴 인터랙티브 맵**입니다.

---

## 타겟 지역 (데모용)

| 지역 | 특징 | 마스코트 변화 | 인터랙션 |
|------|------|---------------|----------|
| **경복궁** | 전통 궁궐, 한옥 | 한복 + 갓 | 아리랑 BGM, 수문장 교대식 시간대 이벤트 |
| **이태원/해방촌** | 다국적 문화, 클럽 | DJ 헤드폰 + 스트릿웨어 | 지역 특성 음악, 네온 조명 |
| **홍대** | 예술, 인디문화 | 베레모 + 물감 묻은 앞치마 | 버스킹 음악, 그래피티 벽 |
| **강남역** | 현대 도시, 비즈니스 | 정장 + 에어팟 | K-pop BGM, 지하상가 탐험 |

---

## 기술 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Web)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │  Three.js   │  │  React/Vue  │  │ Web Audio   │      │
│  │  3D 렌더링  │  │     UI      │  │   API       │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend API                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Gemini API Integration              │    │
│  │  • Imagen 3 (건물/거리 텍스처 생성)              │    │
│  │  • Gemini Pro (지역 설명/스토리텔링)             │    │
│  │  • Gemini Vision (참조 이미지 → 3D 텍스처)       │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
│  • 지역별 POI 데이터 (위치, 특징, 메타데이터)           │
│  • 3D 모델 에셋 (기본 건물 형태)                        │
│  • 오디오 에셋 (지역별 BGM)                              │
│  • 마스코트 에셋 (의상/액세서리 variants)               │
└─────────────────────────────────────────────────────────┘
```

---

## 핵심 기능 설계

### 1. AI 기반 3D 맵 생성

```typescript
// 지역 데이터 구조
interface District {
  id: string;
  name: string;
  bounds: { lat: [number, number]; lng: [number, number] };
  theme: {
    style: "traditional" | "modern" | "artistic" | "nightlife";
    colorPalette: string[];
    architectureStyle: string;
  };
  pois: POI[];
  audio: AudioConfig;
  mascotConfig: MascotVariant;
}

// Gemini로 건물 텍스처 생성 요청
async function generateBuildingTexture(building: Building, district: District) {
  const prompt = `
    Create a stylized texture for a ${building.type} building
    in ${district.name}, Seoul, Korea.
    Style: ${district.theme.architectureStyle}
    Color palette: ${district.theme.colorPalette.join(', ')}
    Artistic, game-ready, isometric view
  `;
  return await geminiImagen.generate(prompt);
}
```

### 2. 마스코트 동적 변환 시스템

```typescript
interface MascotVariant {
  districtId: string;
  outfit: {
    head: string;      // "hanbok_gat" | "dj_headphones" | "beret"
    body: string;      // "hanbok" | "streetwear" | "suit"
    accessory: string; // "fan" | "spray_can" | "airpods"
  };
  animation: string;   // "bow" | "dance" | "paint" | "walk"
  mood: string;        // 표정/분위기
}

// 지역 진입 시 마스코트 변환
function onEnterDistrict(districtId: string) {
  const variant = getVariantForDistrict(districtId);
  mascot.transitionTo(variant, { duration: 1.5, easing: 'smooth' });
  audioManager.crossfadeTo(district.audio.bgm);
}
```

### 3. 인터랙티브 POI 시스템

```typescript
interface POI {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  type: "landmark" | "shop" | "restaurant" | "street_art";
  interactions: Interaction[];
}

interface Interaction {
  trigger: "proximity" | "click" | "time";
  action: "play_audio" | "show_info" | "animate" | "gemini_narrate";
  config: {
    // Gemini로 실시간 설명 생성
    geminiPrompt?: string;
    audioFile?: string;
    animation?: string;
  };
}
```

---

## 차별화 포인트

### Gemini 기술 활용 극대화

| 기능 | Gemini 활용 |
|------|-------------|
| **건물 텍스처** | Imagen 3로 한국 전통/현대 건축 스타일 생성 |
| **POI 설명** | Gemini Pro로 실시간 한국어/영어 가이드 생성 |
| **마스코트 대화** | Gemini Chat으로 지역 정보 대화형 안내 |
| **동적 이벤트** | 현재 시간/날씨 기반 맵 분위기 변화 |

### 스토리텔링

> "우리는 보안 제한을 **제약이 아닌 기회**로 바꿨습니다.
> 실제 위성 사진 대신, AI가 그린 **문화적 해석**을 담은 지도를 만들었습니다."

---

## 프로젝트 구조

```
seoul-birds-eye/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map3D/          # Three.js 3D 맵
│   │   │   ├── Mascot/         # 마스코트 렌더링/애니메이션
│   │   │   ├── UI/             # 컨트롤, 정보 패널
│   │   │   └── Audio/          # 공간 오디오
│   │   ├── districts/          # 지역별 설정
│   │   ├── hooks/
│   │   └── services/
│   └── public/
│       └── assets/
│           ├── models/         # 3D 모델 (glTF)
│           ├── textures/       # 생성된 텍스처 캐시
│           └── audio/          # BGM, 효과음
├── backend/
│   ├── api/
│   │   ├── gemini/            # Gemini API 래퍼
│   │   ├── districts/         # 지역 데이터 API
│   │   └── generate/          # 텍스처/콘텐츠 생성
│   └── data/
│       └── districts.json     # 지역 메타데이터
└── docs/
    └── presentation/          # 해커톤 발표 자료
```

---

## MVP 스코프 (해커톤 시간 고려)

**최소 데모 범위**: 경복궁 + 이태원 2개 지역

- [ ] 2개 지역의 간단한 3D 맵 (기본 블록 건물)
- [ ] Gemini Imagen으로 생성한 건물 텍스처 적용
- [ ] 마스코트 1개 + 2가지 의상 변환
- [ ] 지역별 BGM 재생
- [ ] 1~2개 POI 클릭 시 Gemini가 설명 생성

---

## 기술 스택

### Frontend
- **3D 렌더링**: Three.js / React Three Fiber
- **UI 프레임워크**: React / Next.js
- **오디오**: Web Audio API / Howler.js
- **상태 관리**: Zustand

### Backend
- **런타임**: Node.js
- **API**: Express / Fastify
- **AI**: Google Gemini API (Imagen 3, Gemini Pro)

### 인프라
- **호스팅**: Vercel / Google Cloud Run
- **에셋 저장**: Google Cloud Storage
