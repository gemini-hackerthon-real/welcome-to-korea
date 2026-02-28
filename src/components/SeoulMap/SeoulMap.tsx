"use client";

import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Polygon, Marker, InfoWindow } from "@react-google-maps/api";

// 서울 중심 좌표 (4개 지역이 한눈에 보이도록 조정)
const SEOUL_CENTER = {
  lat: 37.54,
  lng: 126.98,
};

// 줌 임계값 - 이 이상 확대하면 3D로 전환
const ZOOM_THRESHOLD = 15;

// 4개 지역 폴리곤 좌표 (실제 지형/경계 반영)
const DISTRICT_POLYGONS = {
  gyeongbokgung: {
    id: "gyeongbokgung",
    name: "경복궁",
    icon: "🏯",
    color: "#8B4513",
    // 경복궁 담장 경계 (실제 궁궐 형태)
    paths: [
      { lat: 37.5835, lng: 126.9768 }, // 북쪽 중앙 (신무문)
      { lat: 37.5832, lng: 126.9795 }, // 북동쪽
      { lat: 37.5820, lng: 126.9805 }, // 동쪽 상단
      { lat: 37.5790, lng: 126.9808 }, // 동쪽 (동십자각 위)
      { lat: 37.5762, lng: 126.9798 }, // 동십자각
      { lat: 37.5755, lng: 126.9785 }, // 광화문 동쪽
      { lat: 37.5755, lng: 126.9755 }, // 광화문 서쪽
      { lat: 37.5762, lng: 126.9742 }, // 서십자각
      { lat: 37.5790, lng: 126.9732 }, // 서쪽 (영추문 아래)
      { lat: 37.5820, lng: 126.9735 }, // 서쪽 상단
      { lat: 37.5832, lng: 126.9745 }, // 북서쪽
    ],
    center: { lat: 37.5796, lng: 126.9770 },
  },
  itaewon: {
    id: "itaewon",
    name: "이태원",
    icon: "🎉",
    color: "#FF1493",
    // 이태원 상권 경계 (이태원로 따라)
    paths: [
      { lat: 37.5378, lng: 126.9895 }, // 녹사평역 방면
      { lat: 37.5372, lng: 126.9928 }, // 해밀턴호텔 북쪽
      { lat: 37.5365, lng: 126.9965 }, // 이태원역 북쪽
      { lat: 37.5355, lng: 126.9998 }, // 한강진역 방면
      { lat: 37.5340, lng: 127.0015 }, // 동쪽 끝
      { lat: 37.5318, lng: 127.0005 }, // 남산 방면
      { lat: 37.5308, lng: 126.9968 }, // 남쪽 중앙
      { lat: 37.5305, lng: 126.9925 }, // 경리단길 남쪽
      { lat: 37.5315, lng: 126.9888 }, // 서쪽 하단
      { lat: 37.5335, lng: 126.9878 }, // 녹사평 남쪽
      { lat: 37.5358, lng: 126.9882 }, // 북서쪽
    ],
    center: { lat: 37.5340, lng: 126.9946 },
  },
  hongdae: {
    id: "hongdae",
    name: "홍대",
    icon: "🎨",
    color: "#9370DB",
    // 홍대 상권 경계 (홍대입구역 중심)
    paths: [
      { lat: 37.5598, lng: 126.9218 }, // 연남동 방면 북쪽
      { lat: 37.5595, lng: 126.9255 }, // 홍대입구역 북쪽
      { lat: 37.5582, lng: 126.9285 }, // 동쪽 상단
      { lat: 37.5565, lng: 126.9305 }, // 상수역 방면
      { lat: 37.5538, lng: 126.9298 }, // 동쪽 하단
      { lat: 37.5518, lng: 126.9275 }, // 합정역 방면
      { lat: 37.5515, lng: 126.9238 }, // 남쪽 중앙
      { lat: 37.5525, lng: 126.9198 }, // 서쪽 하단
      { lat: 37.5548, lng: 126.9175 }, // 연남동 남쪽
      { lat: 37.5575, lng: 126.9178 }, // 연남동 중앙
      { lat: 37.5592, lng: 126.9195 }, // 북서쪽
    ],
    center: { lat: 37.5563, lng: 126.9234 },
  },
  gangnam: {
    id: "gangnam",
    name: "강남",
    icon: "🏙️",
    color: "#4169E1",
    // 강남역 상권 경계 (테헤란로 일대)
    paths: [
      { lat: 37.5028, lng: 127.0235 }, // 역삼역 방면 북쪽
      { lat: 37.5022, lng: 127.0285 }, // 테헤란로 북쪽
      { lat: 37.5015, lng: 127.0338 }, // 동쪽 상단
      { lat: 37.4998, lng: 127.0365 }, // 선릉역 방면
      { lat: 37.4968, lng: 127.0358 }, // 동쪽 하단
      { lat: 37.4945, lng: 127.0325 }, // 남쪽 동편
      { lat: 37.4935, lng: 127.0275 }, // 강남역 남쪽
      { lat: 37.4942, lng: 127.0228 }, // 신논현역 방면
      { lat: 37.4958, lng: 127.0195 }, // 서쪽 하단
      { lat: 37.4985, lng: 127.0185 }, // 교보타워 방면
      { lat: 37.5012, lng: 127.0205 }, // 북서쪽
    ],
    center: { lat: 37.4980, lng: 127.0276 },
  },
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  gestureHandling: "greedy",
  styles: [
    {
      elementType: "geometry",
      stylers: [{ color: "#1d2c4d" }],
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#8ec3b9" }],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#1a3646" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#304a7d" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#255763" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#0e1626" }],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#283d6a" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
  ],
};

interface SeoulMapProps {
  onDistrictSelect: (district: {
    id: string;
    name: string;
    icon: string;
    color: string;
  }) => void;
  targetLocation?: {
    placeId: string;
    lat: number;
    lng: number;
  } | null;
}

export default function SeoulMap({ onDistrictSelect, targetLocation }: SeoulMapProps) {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(12);
  const [nearestDistrict, setNearestDistrict] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 로더 옵션 메모이제이션
  const loaderOptions = useMemo(() => ({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  }), []);

  const { isLoaded, loadError } = useJsApiLoader(loaderOptions);

  // 현재 맵 중심에서 가장 가까운 지역 찾기
  const findNearestDistrict = useCallback((center: google.maps.LatLng) => {
    let nearest: string | null = null;
    let minDistance = Infinity;

    Object.values(DISTRICT_POLYGONS).forEach((district) => {
      const distance = Math.sqrt(
        Math.pow(center.lat() - district.center.lat, 2) +
        Math.pow(center.lng() - district.center.lng, 2)
      );

      // 지역 범위 내에 있는지 확인
      const inBounds =
        center.lat() >= Math.min(...district.paths.map(p => p.lat)) &&
        center.lat() <= Math.max(...district.paths.map(p => p.lat)) &&
        center.lng() >= Math.min(...district.paths.map(p => p.lng)) &&
        center.lng() <= Math.max(...district.paths.map(p => p.lng));

      if (inBounds && distance < minDistance) {
        minDistance = distance;
        nearest = district.id;
      }
    });

    return nearest;
  }, []);

  // 줌 레벨과 위치 변화 감지
  const handleMapChange = useCallback(() => {
    if (!mapRef.current) return;

    const zoom = mapRef.current.getZoom();
    const center = mapRef.current.getCenter();

    if (zoom !== undefined) {
      setCurrentZoom(zoom);
    }

    if (center) {
      const nearest = findNearestDistrict(center);
      setNearestDistrict(nearest);

      // 줌 레벨이 임계값 이상이고 지역 내에 있으면 전환
      if (zoom && zoom >= ZOOM_THRESHOLD && nearest) {
        // 디바운스: 이미 전환 예정이면 취소
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }

        // 0.5초 후 전환 (사용자가 계속 조작 중일 수 있음)
        transitionTimeoutRef.current = setTimeout(() => {
          const district = DISTRICT_POLYGONS[nearest as keyof typeof DISTRICT_POLYGONS];
          if (district) {
            onDistrictSelect({
              id: district.id,
              name: district.name,
              icon: district.icon,
              color: district.color,
            });
          }
        }, 500);
      }
    }
  }, [findNearestDistrict, onDistrictSelect]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    map.setZoom(12);

    // 줌/이동 이벤트 리스너
    map.addListener("zoom_changed", handleMapChange);
    map.addListener("center_changed", handleMapChange);
  }, [handleMapChange]);

  // 클린업
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // targetLocation이 변경되면 해당 위치로 이동
  useEffect(() => {
    if (targetLocation && mapRef.current) {
      // 부드럽게 해당 위치로 이동
      mapRef.current.panTo({ lat: targetLocation.lat, lng: targetLocation.lng });
      mapRef.current.setZoom(16); // 상세 줌 레벨

      // 해당 지역 하이라이트
      setHoveredDistrict(targetLocation.placeId);

      // 2초 후 하이라이트 제거
      setTimeout(() => {
        setHoveredDistrict(null);
      }, 2000);
    }
  }, [targetLocation]);

  if (loadError) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <p className="text-red-400">지도를 불러올 수 없습니다.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🗺️</div>
          <p className="text-white">지도 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={SEOUL_CENTER}
        zoom={13}
        options={mapOptions}
        onLoad={onLoad}
      >
        {Object.values(DISTRICT_POLYGONS).map((district) => (
          <Polygon
            key={district.id}
            paths={district.paths}
            options={{
              fillColor: district.color,
              fillOpacity: hoveredDistrict === district.id ? 0.6 : 0.3,
              strokeColor: district.color,
              strokeOpacity: 1,
              strokeWeight: hoveredDistrict === district.id ? 4 : 2,
            }}
            onMouseOver={() => setHoveredDistrict(district.id)}
            onMouseOut={() => setHoveredDistrict(null)}
            onClick={() =>
              onDistrictSelect({
                id: district.id,
                name: district.name,
                icon: district.icon,
                color: district.color,
              })
            }
          />
        ))}
        {/* 지역 마커 및 라벨 */}
        {Object.values(DISTRICT_POLYGONS).map((district) => (
          <Marker
            key={`marker-${district.id}`}
            position={district.center}
            label={{
              text: `${district.icon} ${district.name}`,
              color: district.color,
              fontSize: "14px",
              fontWeight: "bold",
              className: "map-marker-label",
            }}
            icon={{
              path: "M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12zm0 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z",
              scale: 1.8,
              fillColor: district.color,
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              anchor: new google.maps.Point(12, 36),
              labelOrigin: new google.maps.Point(12, -15),
            }}
            onClick={() =>
              onDistrictSelect({
                id: district.id,
                name: district.name,
                icon: district.icon,
                color: district.color,
              })
            }
          />
        ))}
      </GoogleMap>

      {/* 줌 안내 */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur px-6 py-3 rounded-full transition-all duration-300">
        <p className="text-white text-sm">
          {currentZoom >= ZOOM_THRESHOLD && nearestDistrict ? (
            <span className="text-green-400 animate-pulse">
              ✨ {DISTRICT_POLYGONS[nearestDistrict as keyof typeof DISTRICT_POLYGONS]?.name}으로 진입 중...
            </span>
          ) : nearestDistrict ? (
            <span>
              🔍 {DISTRICT_POLYGONS[nearestDistrict as keyof typeof DISTRICT_POLYGONS]?.icon}{" "}
              {DISTRICT_POLYGONS[nearestDistrict as keyof typeof DISTRICT_POLYGONS]?.name} 근처 - 더 확대하면 3D로 전환됩니다
            </span>
          ) : (
            <span>🗺️ 지역을 확대하면 3D 뷰로 전환됩니다 (현재 줌: {currentZoom})</span>
          )}
        </p>
      </div>

      {/* 줌 레벨 표시 + 지역 바로가기 */}
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur px-3 py-2 rounded-lg">
        <div className="text-white text-xs mb-1">줌 레벨</div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-200"
              style={{ width: `${Math.min((currentZoom / 20) * 100, 100)}%` }}
            />
          </div>
          <span className={`text-sm font-mono ${currentZoom >= ZOOM_THRESHOLD ? 'text-green-400' : 'text-gray-400'}`}>
            {currentZoom}
          </span>
        </div>
        {currentZoom < ZOOM_THRESHOLD && (
          <p className="text-gray-500 text-xs mt-1">3D 전환: {ZOOM_THRESHOLD}+</p>
        )}

        {/* 지역 바로가기 */}
        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-white/70 text-xs mb-2">지역 바로가기</p>
          <div className="grid grid-cols-2 gap-1">
            {Object.values(DISTRICT_POLYGONS).map((district) => (
              <button
                key={district.id}
                onClick={() =>
                  onDistrictSelect({
                    id: district.id,
                    name: district.name,
                    icon: district.icon,
                    color: district.color,
                  })
                }
                onMouseEnter={() => setHoveredDistrict(district.id)}
                onMouseLeave={() => setHoveredDistrict(null)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all text-xs ${
                  hoveredDistrict === district.id || nearestDistrict === district.id
                    ? "bg-white/20"
                    : "hover:bg-white/10"
                }`}
              >
                <span>{district.icon}</span>
                <span className="text-white">{district.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
