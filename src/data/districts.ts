// 지역 데이터 정의

import { District } from "@/types";

export const DISTRICTS: District[] = [
  {
    id: "gyeongbokgung",
    name: "Gyeongbokgung",
    nameKo: "경복궁",
    description: "조선 왕조의 법궁, 전통 한옥과 궁궐 건축의 아름다움",
    bounds: {
      center: { lat: 37.5796, lng: 126.977 },
      radius: 0.5,
    },
    theme: {
      style: "traditional",
      colorPalette: ["#8B4513", "#DAA520", "#2F4F4F", "#DEB887", "#800000"],
      architectureStyle: "traditional Korean palace, dancheong patterns, curved roofs",
      ambiance: "고요하고 웅장한 전통 궁궐의 분위기",
    },
    audio: {
      bgm: "/audio/gyeongbokgung-bgm.mp3",
      volume: 0.6,
      loop: true,
      ambientSounds: ["/audio/wind-chimes.mp3", "/audio/birds.mp3"],
    },
    mascotVariant: "gyeongbokgung_hanbok",
    pois: [
      {
        id: "gwanghwamun",
        name: "Gwanghwamun Gate",
        nameKo: "광화문",
        type: "landmark",
        position: { x: 0, y: 0, z: -50 },
        description: "경복궁의 정문, 수문장 교대식이 열리는 곳",
        interactions: [
          {
            id: "gwanghwamun-guard",
            trigger: "time",
            action: "animate",
            config: {
              timeCondition: { startHour: 10, endHour: 15 },
              animationName: "guard_ceremony",
            },
          },
          {
            id: "gwanghwamun-info",
            trigger: "click",
            action: "gemini_narrate",
            config: {
              geminiPrompt:
                "경복궁 광화문에 대해 흥미로운 역사적 사실을 2-3문장으로 설명해주세요. 친근한 말투로.",
            },
          },
        ],
      },
      {
        id: "geunjeongjeon",
        name: "Geunjeongjeon Hall",
        nameKo: "근정전",
        type: "landmark",
        position: { x: 0, y: 0, z: 50 },
        description: "경복궁의 정전, 국가 의례가 열리던 곳",
        interactions: [
          {
            id: "geunjeongjeon-info",
            trigger: "click",
            action: "show_info",
            config: {
              infoContent: {
                title: "근정전",
                description: "조선 왕의 즉위식과 국가 행사가 열리던 경복궁의 중심 건물",
              },
            },
          },
        ],
      },
      {
        id: "gyeonghoeru",
        name: "Gyeonghoeru Pavilion",
        nameKo: "경회루",
        type: "landmark",
        position: { x: -40, y: 0, z: 30 },
        description: "연못 위의 누각, 연회와 외국 사신 접대 장소",
        interactions: [
          {
            id: "gyeonghoeru-ambient",
            trigger: "proximity",
            action: "play_audio",
            config: {
              proximityRadius: 20,
              audioFile: "/audio/water-ambient.mp3",
            },
          },
        ],
      },
    ],
  },
  {
    id: "itaewon",
    name: "Itaewon",
    nameKo: "이태원",
    description: "다국적 문화가 어우러진 서울의 밤문화 중심지",
    bounds: {
      center: { lat: 37.5345, lng: 126.9946 },
      radius: 0.4,
    },
    theme: {
      style: "nightlife",
      colorPalette: ["#FF1493", "#00CED1", "#FFD700", "#9400D3", "#FF4500"],
      architectureStyle: "neon lights, modern clubs, diverse international restaurants",
      ambiance: "활기차고 다양한 문화가 섞인 밤의 거리",
    },
    audio: {
      bgm: "/audio/itaewon-bgm.mp3",
      volume: 0.7,
      loop: true,
      ambientSounds: ["/audio/crowd-chatter.mp3", "/audio/distant-music.mp3"],
    },
    mascotVariant: "itaewon_dj",
    pois: [
      {
        id: "world-food-street",
        name: "World Food Street",
        nameKo: "세계음식거리",
        type: "restaurant",
        position: { x: -20, y: 0, z: 0 },
        description: "전 세계 음식을 맛볼 수 있는 거리",
        interactions: [
          {
            id: "food-street-info",
            trigger: "click",
            action: "gemini_narrate",
            config: {
              geminiPrompt:
                "이태원 세계음식거리에서 꼭 먹어봐야 할 음식 3가지를 추천해주세요. 재미있게!",
            },
          },
        ],
      },
      {
        id: "hamilton-hotel",
        name: "Hamilton Hotel Area",
        nameKo: "해밀턴호텔 앞",
        type: "entertainment",
        position: { x: 0, y: 0, z: -30 },
        description: "이태원의 중심, 클럽과 바가 밀집한 지역",
        interactions: [
          {
            id: "hamilton-dance",
            trigger: "proximity",
            action: "change_mood",
            config: {
              proximityRadius: 15,
            },
          },
        ],
      },
      {
        id: "antique-street",
        name: "Antique Furniture Street",
        nameKo: "앤티크가구거리",
        type: "shop",
        position: { x: 30, y: 0, z: 20 },
        description: "빈티지 가구와 소품을 판매하는 거리",
        interactions: [
          {
            id: "antique-info",
            trigger: "click",
            action: "show_info",
            config: {
              infoContent: {
                title: "앤티크가구거리",
                description: "1970년대부터 형성된 빈티지 가구 상점가",
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: "hongdae",
    name: "Hongdae",
    nameKo: "홍대",
    description: "예술과 인디문화의 중심지, 젊음의 거리",
    bounds: {
      center: { lat: 37.5563, lng: 126.9234 },
      radius: 0.4,
    },
    theme: {
      style: "artistic",
      colorPalette: ["#9370DB", "#FF6347", "#00FA9A", "#FFB6C1", "#87CEEB"],
      architectureStyle: "graffiti walls, indie cafes, art galleries, street performances",
      ambiance: "자유롭고 창의적인 예술가의 거리",
    },
    audio: {
      bgm: "/audio/hongdae-bgm.mp3",
      volume: 0.65,
      loop: true,
      ambientSounds: ["/audio/busking.mp3", "/audio/street-crowd.mp3"],
    },
    mascotVariant: "hongdae_artist",
    pois: [
      {
        id: "busking-street",
        name: "Busking Street",
        nameKo: "버스킹거리",
        type: "entertainment",
        position: { x: 0, y: 0, z: 0 },
        description: "매주 주말 버스킹 공연이 열리는 거리",
        interactions: [
          {
            id: "busking-music",
            trigger: "proximity",
            action: "play_audio",
            config: {
              proximityRadius: 25,
              audioFile: "/audio/busking-live.mp3",
            },
          },
        ],
      },
      {
        id: "graffiti-wall",
        name: "Graffiti Wall",
        nameKo: "그래피티 벽",
        type: "street_art",
        position: { x: -25, y: 0, z: 15 },
        description: "아티스트들의 그래피티로 가득한 벽",
        interactions: [
          {
            id: "graffiti-info",
            trigger: "click",
            action: "gemini_narrate",
            config: {
              geminiPrompt: "홍대 그래피티 문화의 역사와 의미를 짧게 설명해주세요.",
            },
          },
        ],
      },
      {
        id: "playground",
        name: "Hongdae Playground",
        nameKo: "홍대 놀이터",
        type: "landmark",
        position: { x: 20, y: 0, z: -20 },
        description: "프리마켓과 공연이 열리는 문화 공간",
        interactions: [
          {
            id: "playground-info",
            trigger: "click",
            action: "show_info",
            config: {
              infoContent: {
                title: "홍대 놀이터",
                description: "주말마다 프리마켓과 버스킹이 열리는 홍대의 상징적 공간",
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: "gangnam",
    name: "Gangnam",
    nameKo: "강남",
    description: "현대적인 비즈니스와 쇼핑의 중심지",
    bounds: {
      center: { lat: 37.498, lng: 127.0276 },
      radius: 0.5,
    },
    theme: {
      style: "modern",
      colorPalette: ["#4169E1", "#C0C0C0", "#000080", "#F5F5F5", "#2F4F4F"],
      architectureStyle: "modern skyscrapers, luxury shopping malls, sleek office buildings",
      ambiance: "세련되고 바쁜 대도시의 심장부",
    },
    audio: {
      bgm: "/audio/gangnam-bgm.mp3",
      volume: 0.5,
      loop: true,
      ambientSounds: ["/audio/city-traffic.mp3", "/audio/construction.mp3"],
    },
    mascotVariant: "gangnam_business",
    pois: [
      {
        id: "gangnam-station",
        name: "Gangnam Station",
        nameKo: "강남역",
        type: "landmark",
        position: { x: 0, y: 0, z: 0 },
        description: "서울에서 가장 바쁜 지하철역 중 하나",
        interactions: [
          {
            id: "gangnam-kpop",
            trigger: "proximity",
            action: "play_audio",
            config: {
              proximityRadius: 30,
              audioFile: "/audio/kpop-hits.mp3",
            },
          },
        ],
      },
      {
        id: "coex",
        name: "COEX Mall",
        nameKo: "코엑스몰",
        type: "shop",
        position: { x: 50, y: 0, z: 30 },
        description: "아시아 최대의 지하 쇼핑몰",
        interactions: [
          {
            id: "coex-info",
            trigger: "click",
            action: "gemini_narrate",
            config: {
              geminiPrompt: "코엑스몰의 별마당 도서관과 아쿠아리움에 대해 소개해주세요.",
            },
          },
        ],
      },
      {
        id: "teheran-ro",
        name: "Teheran-ro",
        nameKo: "테헤란로",
        type: "landmark",
        position: { x: -30, y: 0, z: -20 },
        description: "한국 IT 산업의 중심, 스타트업 밸리",
        interactions: [
          {
            id: "teheran-info",
            trigger: "click",
            action: "show_info",
            config: {
              infoContent: {
                title: "테헤란로",
                description: "한국의 실리콘밸리, 수많은 IT 기업과 스타트업이 밀집",
              },
            },
          },
        ],
      },
    ],
  },
];

// 지역 ID로 지역 찾기
export function getDistrictById(id: string): District | undefined {
  return DISTRICTS.find((d) => d.id === id);
}

// 좌표로 현재 지역 찾기
export function getDistrictByCoords(lat: number, lng: number): District | undefined {
  return DISTRICTS.find((district) => {
    const { center, radius } = district.bounds;
    const distance = Math.sqrt(
      Math.pow(lat - center.lat, 2) + Math.pow(lng - center.lng, 2)
    );
    // 대략적인 계산 (1도 ≈ 111km)
    return distance * 111 <= radius;
  });
}
