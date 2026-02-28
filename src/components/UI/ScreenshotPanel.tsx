"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";
import { analyzeScreenshot } from "@/services/gemini";
import { AnalysisResult, CameraPreset } from "@/types/camera";

interface ScreenshotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToView: (preset: CameraPreset, placeId: string) => void;
}

export default function ScreenshotPanel({
  isOpen,
  onClose,
  onJumpToView,
}: ScreenshotPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeScreenshot(imageBase64);
      setResult(analysisResult);

      if (analysisResult.place_id === "unknown") {
        setError("인식할 수 없는 장소입니다. 서울 관광지 사진을 업로드해주세요.");
      }
    } catch (err) {
      setError("이미지 분석 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleJumpToView = () => {
    if (result?.camera_preset && result.place_id !== "unknown") {
      onJumpToView(result.camera_preset, result.place_id);
      onClose();
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-400";
    if (confidence >= 0.5) return "text-yellow-400";
    return "text-red-400";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "높음";
    if (confidence >= 0.5) return "보통";
    return "낮음";
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-20 left-4 z-20 w-80 bg-black/90 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* 헤더 */}
      <div className="p-3 border-b border-white/10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-between">
        <div>
          <p className="text-white font-bold flex items-center gap-2">
            <span>📷</span> 스크린샷 인식
          </p>
          <p className="text-gray-400 text-xs">사진으로 장소 찾기</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* 본문 */}
      <div className="p-4 space-y-4">
        {/* 이미지 업로더 */}
        <ImageUploader onImageSelect={handleImageSelect} isLoading={isAnalyzing} />

        {/* 에러 메시지 */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* 분석 결과 */}
        {result && result.place_id !== "unknown" && (
          <div className="space-y-3">
            {/* 장소 정보 */}
            <div className="p-3 bg-white/5 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">인식된 장소</span>
                <span className={`text-xs ${getConfidenceColor(result.confidence)}`}>
                  신뢰도: {getConfidenceLabel(result.confidence)} ({Math.round(result.confidence * 100)}%)
                </span>
              </div>
              <p className="text-white font-bold text-lg">{result.place_name}</p>

              {/* 뷰 타입 */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">뷰 타입:</span>
                <span className="px-2 py-0.5 bg-purple-500/30 rounded text-purple-300 text-xs">
                  {result.view_type}
                </span>
              </div>

              {/* 랜드마크 */}
              {result.landmarks.length > 0 && (
                <div>
                  <span className="text-gray-400 text-xs">감지된 랜드마크:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.landmarks.map((landmark, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-white/10 rounded text-white/80 text-xs"
                      >
                        {landmark}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3D 뷰로 이동 버튼 */}
            {result.camera_preset && (
              <button
                onClick={handleJumpToView}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl text-white font-bold flex items-center justify-center gap-2 hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg"
              >
                <span>🎯</span>
                <span>3D 뷰로 이동</span>
                <span className="text-xs opacity-80">({result.camera_preset.nameKo})</span>
              </button>
            )}
          </div>
        )}

        {/* 사용법 안내 */}
        {!result && !isAnalyzing && (
          <div className="text-center py-2">
            <p className="text-gray-500 text-xs">
              경복궁, 홍대, 이태원, 강남 사진을 업로드하면
              <br />
              해당 위치의 3D 뷰로 바로 이동할 수 있어요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
