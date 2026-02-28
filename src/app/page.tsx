"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

const RealisticMap = dynamic(() => import("@/components/Map3D/RealisticMap"), {
  ssr: false,
  loading: () => <MapLoading />,
});

const SeoulMap = dynamic(() => import("@/components/SeoulMap/SeoulMap"), {
  ssr: false,
  loading: () => <MapLoading />,
});

function MapLoading() {
  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-bounce">🗺️</div>
        <p className="text-white">로딩 중...</p>
      </div>
    </div>
  );
}

interface District {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export default function Home() {
  const [currentDistrict, setCurrentDistrict] = useState<District | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDistrictSelect = useCallback((district: District) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentDistrict(district);
      setMessages([]);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 300);
  }, []);

  const handleBackToMap = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentDistrict(null);
      setChatOpen(false);
      setMessages([]);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 300);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !currentDistrict) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, district: currentDistrict.name }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "죄송해요, 잠시 문제가 생겼어요!" },
      ]);
    }
    setLoading(false);
  };

  // 지도 뷰 (초기 화면)
  if (!currentDistrict) {
    return (
      <main className="relative w-full h-screen bg-black overflow-hidden">
        {/* 전환 오버레이 */}
        <div
          className={`absolute inset-0 bg-black z-50 pointer-events-none transition-opacity duration-300 ${
            isTransitioning ? "opacity-100" : "opacity-0"
          }`}
        />

        <SeoulMap onDistrictSelect={handleDistrictSelect} />

        {/* Header */}
        <div className="absolute top-4 left-4 z-10">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            서울 버드아이
          </h1>
          <p className="text-gray-400 text-sm">Seoul Bird&apos;s Eye</p>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 right-4 z-10">
          <p className="text-gray-600 text-xs">Powered by Google Gemini</p>
        </div>
      </main>
    );
  }

  // 3D 뷰 (지역 선택 후)
  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      {/* 전환 오버레이 */}
      <div
        className={`absolute inset-0 bg-black z-50 pointer-events-none transition-opacity duration-300 ${
          isTransitioning ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 3D Map */}
      <RealisticMap district={currentDistrict} onZoomOut={handleBackToMap} />

      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          서울 버드아이
        </h1>
        <p className="text-gray-400 text-sm">Seoul Bird&apos;s Eye</p>
      </div>

      {/* Back Button */}
      <button
        onClick={handleBackToMap}
        className="absolute top-4 right-4 z-10 px-4 py-2 bg-black/70 backdrop-blur rounded-full text-white flex items-center gap-2 hover:bg-black/90 transition-all"
      >
        <span>←</span>
        <span>지도로 돌아가기</span>
      </button>

      {/* Current District Info */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
        <div
          className="px-6 py-3 rounded-full flex items-center gap-3 animate-fade-in"
          style={{ backgroundColor: `${currentDistrict.color}dd` }}
        >
          <span className="text-2xl">{currentDistrict.icon}</span>
          <span className="text-white font-bold text-lg">{currentDistrict.name}</span>
        </div>
      </div>

      {/* Mascot Info */}
      <div className="absolute top-32 right-4 z-10 p-4 bg-black/70 backdrop-blur rounded-xl max-w-xs">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ background: currentDistrict.color }}
          >
            {getMascotEmoji(currentDistrict.id)}
          </div>
          <div>
            <p className="text-white font-bold">버디</p>
            <p className="text-gray-400 text-sm">{currentDistrict.name} 가이드</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm">{getMascotDescription(currentDistrict.id)}</p>
      </div>

      {/* Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="absolute bottom-4 right-4 z-10 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
      >
        {chatOpen ? "✕" : "💬"}
      </button>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="absolute bottom-20 right-4 z-10 w-80 h-96 bg-black/90 backdrop-blur rounded-2xl flex flex-col overflow-hidden border border-white/10">
          <div className="p-3 border-b border-white/10 bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
            <p className="text-white font-bold">버디에게 물어보세요!</p>
            <p className="text-gray-400 text-xs">{currentDistrict.name} 가이드</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <p className="text-gray-500 text-sm text-center mt-4">
                {currentDistrict.name}에 대해 물어보세요!
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    m.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 px-3 py-2 rounded-2xl text-gray-400 text-sm">
                  입력 중...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="메시지 입력..."
              className="flex-1 bg-white/10 text-white px-3 py-2 rounded-full text-sm outline-none"
            />
            <button
              onClick={sendMessage}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <p className="text-gray-600 text-xs">Powered by Google Gemini</p>
      </div>
    </main>
  );
}

function getMascotEmoji(districtId: string) {
  switch (districtId) {
    case "gyeongbokgung":
      return "🎎";
    case "itaewon":
      return "🎧";
    case "hongdae":
      return "🎨";
    case "gangnam":
      return "💼";
    default:
      return "🐥";
  }
}

function getMascotDescription(districtId: string) {
  switch (districtId) {
    case "gyeongbokgung":
      return "한복을 입고 갓을 쓴 버디가 전통 문화를 안내해드려요.";
    case "itaewon":
      return "DJ 헤드폰을 쓴 버디가 신나는 이태원을 소개해드려요!";
    case "hongdae":
      return "베레모를 쓴 예술가 버디가 창작의 거리를 안내해요.";
    case "gangnam":
      return "세련된 정장의 버디가 트렌디한 강남을 소개합니다.";
    default:
      return "버디가 서울을 안내해드려요!";
  }
}
