"use client";

// 오디오 컨트롤러 컴포넌트

import { useEffect, useRef } from "react";
import { Howl } from "howler";
import { motion } from "framer-motion";
import { useGameStore, useCurrentDistrict, useAudioState } from "@/store/gameStore";

export function AudioController() {
  const currentDistrict = useCurrentDistrict();
  const { isMuted, masterVolume } = useAudioState();
  const toggleMute = useGameStore((state) => state.toggleMute);
  const setVolume = useGameStore((state) => state.setVolume);

  const bgmRef = useRef<Howl | null>(null);
  const previousDistrictId = useRef<string | null>(null);

  // 지역 변경 시 BGM 전환
  useEffect(() => {
    if (!currentDistrict) return;

    // 같은 지역이면 스킵
    if (previousDistrictId.current === currentDistrict.id) return;
    previousDistrictId.current = currentDistrict.id;

    // 기존 BGM 페이드아웃
    if (bgmRef.current) {
      const oldBgm = bgmRef.current;
      oldBgm.fade(oldBgm.volume(), 0, 1000);
      setTimeout(() => oldBgm.unload(), 1000);
    }

    // 새 BGM 로드 및 페이드인
    const newBgm = new Howl({
      src: [currentDistrict.audio.bgm],
      loop: currentDistrict.audio.loop,
      volume: 0,
      html5: true,
      onload: () => {
        if (!isMuted) {
          newBgm.play();
          newBgm.fade(0, currentDistrict.audio.volume * masterVolume, 1000);
        }
      },
      onloaderror: () => {
        console.warn(`Failed to load BGM: ${currentDistrict.audio.bgm}`);
      },
    });

    bgmRef.current = newBgm;

    return () => {
      newBgm.unload();
    };
  }, [currentDistrict?.id]);

  // 음소거 상태 변경
  useEffect(() => {
    if (bgmRef.current) {
      if (isMuted) {
        bgmRef.current.pause();
      } else {
        bgmRef.current.play();
      }
    }
  }, [isMuted]);

  // 볼륨 변경
  useEffect(() => {
    if (bgmRef.current && currentDistrict) {
      bgmRef.current.volume(currentDistrict.audio.volume * masterVolume);
    }
  }, [masterVolume]);

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="flex items-center gap-2 p-2 bg-black/60 backdrop-blur-md rounded-full">
        {/* 음소거 버튼 */}
        <motion.button
          onClick={toggleMute}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-lg">{isMuted ? "🔇" : "🔊"}</span>
        </motion.button>

        {/* 볼륨 슬라이더 */}
        <div className="flex items-center gap-2 px-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={masterVolume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            disabled={isMuted}
          />
        </div>

        {/* 현재 지역 표시 */}
        {currentDistrict && (
          <div className="px-3 py-1 text-white text-sm">
            <span className="text-gray-400">Now Playing:</span>{" "}
            <span className="font-medium">{currentDistrict.nameKo}</span>
          </div>
        )}
      </div>
    </div>
  );
}
