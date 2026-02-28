"use client";

// 지역 선택 UI 컴포넌트

import { motion } from "framer-motion";
import { DISTRICTS } from "@/data/districts";
import { useGameStore, useCurrentDistrict } from "@/store/gameStore";

export function DistrictSelector() {
  const currentDistrict = useCurrentDistrict();
  const setCurrentDistrict = useGameStore((state) => state.setCurrentDistrict);

  // 지역별 아이콘
  const getDistrictIcon = (id: string) => {
    switch (id) {
      case "gyeongbokgung":
        return "🏯";
      case "itaewon":
        return "🎉";
      case "hongdae":
        return "🎨";
      case "gangnam":
        return "🏙️";
      default:
        return "📍";
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40">
      <div className="flex gap-2 p-2 bg-black/60 backdrop-blur-md rounded-full">
        {DISTRICTS.map((district) => {
          const isActive = currentDistrict?.id === district.id;

          return (
            <motion.button
              key={district.id}
              onClick={() => setCurrentDistrict(district.id)}
              className={`
                relative px-4 py-2 rounded-full transition-all
                ${isActive ? "text-white" : "text-gray-400 hover:text-white"}
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* 활성화 배경 */}
              {isActive && (
                <motion.div
                  layoutId="activeDistrict"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${district.theme.colorPalette[0]}, ${district.theme.colorPalette[1]})`,
                  }}
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}

              {/* 컨텐츠 */}
              <span className="relative flex items-center gap-2">
                <span className="text-lg">{getDistrictIcon(district.id)}</span>
                <span className="font-medium">{district.nameKo}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
