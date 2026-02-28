"use client";

// POI 정보 패널 컴포넌트

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, useSelectedPOI } from "@/store/gameStore";
import { generateNarration } from "@/services/gemini";

export function InfoPanel() {
  const selectedPOI = useSelectedPOI();
  const isOpen = useGameStore((state) => state.isInfoPanelOpen);
  const toggleInfoPanel = useGameStore((state) => state.toggleInfoPanel);
  const [narration, setNarration] = useState<string>("");
  const [isLoadingNarration, setIsLoadingNarration] = useState(false);

  // POI 선택 시 Gemini 설명 생성
  useEffect(() => {
    if (selectedPOI) {
      const geminiInteraction = selectedPOI.interactions.find(
        (i) => i.action === "gemini_narrate"
      );

      if (geminiInteraction?.config.geminiPrompt) {
        setIsLoadingNarration(true);
        generateNarration(geminiInteraction.config.geminiPrompt)
          .then(setNarration)
          .catch(() => setNarration("설명을 불러올 수 없습니다."))
          .finally(() => setIsLoadingNarration(false));
      } else {
        setNarration(selectedPOI.description || "");
      }
    }
  }, [selectedPOI]);

  // POI 타입 라벨
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "landmark":
        return "랜드마크";
      case "restaurant":
        return "맛집";
      case "shop":
        return "쇼핑";
      case "street_art":
        return "스트릿 아트";
      case "entertainment":
        return "엔터테인먼트";
      default:
        return "장소";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && selectedPOI && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed right-4 top-20 bottom-4 w-80 z-40"
        >
          <div className="h-full bg-black/80 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10">
            {/* 헤더 */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 bg-white/20 rounded text-xs text-gray-300">
                  {getTypeLabel(selectedPOI.type)}
                </span>
                <button
                  onClick={() => toggleInfoPanel(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <span className="text-white">×</span>
                </button>
              </div>
              <h2 className="text-xl font-bold text-white">
                {selectedPOI.nameKo}
              </h2>
              <p className="text-gray-400 text-sm">{selectedPOI.name}</p>
            </div>

            {/* 콘텐츠 */}
            <div className="p-4">
              {/* Gemini 생성 설명 */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <span>✨</span>
                  <span>AI 가이드</span>
                </h3>
                <div className="bg-white/5 rounded-lg p-3">
                  {isLoadingNarration ? (
                    <div className="flex items-center gap-2 text-gray-400">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        ⏳
                      </motion.span>
                      <span>설명 생성 중...</span>
                    </div>
                  ) : (
                    <p className="text-white text-sm leading-relaxed">
                      {narration}
                    </p>
                  )}
                </div>
              </div>

              {/* 인터랙션 목록 */}
              {selectedPOI.interactions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    체험하기
                  </h3>
                  <div className="space-y-2">
                    {selectedPOI.interactions.map((interaction) => (
                      <button
                        key={interaction.id}
                        className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span>{getInteractionIcon(interaction.action)}</span>
                          <span className="text-white text-sm">
                            {getInteractionLabel(interaction.action)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getInteractionIcon(action: string) {
  switch (action) {
    case "play_audio":
      return "🔊";
    case "show_info":
      return "📖";
    case "animate":
      return "🎬";
    case "gemini_narrate":
      return "🤖";
    case "change_mood":
      return "😊";
    default:
      return "✨";
  }
}

function getInteractionLabel(action: string) {
  switch (action) {
    case "play_audio":
      return "소리 듣기";
    case "show_info":
      return "자세히 보기";
    case "animate":
      return "애니메이션 보기";
    case "gemini_narrate":
      return "AI 설명 듣기";
    case "change_mood":
      return "분위기 느끼기";
    default:
      return "체험하기";
  }
}
