"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

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
      <RealisticMap district={currentDistrict} />

      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          서울 버드아이
        </h1>
        <p className="text-gray-400 text-sm">Seoul Bird&apos;s Eye</p>
      </div>

      {/* District Selector */}
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

      {/* Mascot Info */}
      <div className="absolute top-24 right-4 z-10 p-4 bg-black/70 backdrop-blur rounded-xl max-w-xs">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ background: currentDistrict.color }}
          >
            {getMascotEmoji(currentDistrict.id)}
          </div>
          <div>
            <p className="text-white font-bold">버디</p>
            <p className="text-gray-400 text-sm">{currentDistrict.name} 모드</p>
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
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                  m.role === "user" ? "bg-blue-500 text-white" : "bg-white/10 text-white"
                }`}>
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
    case "gyeongbokgung": return "🎎";
    case "itaewon": return "🎧";
    case "hongdae": return "🎨";
    case "gangnam": return "💼";
    default: return "🐥";
  }
}

function getMascotDescription(districtId: string) {
  switch (districtId) {
    case "gyeongbokgung": return "한복을 입고 갓을 쓴 버디가 전통 문화를 안내해드려요.";
    case "itaewon": return "DJ 헤드폰을 쓴 버디가 신나는 이태원을 소개해드려요!";
    case "hongdae": return "베레모를 쓴 예술가 버디가 창작의 거리를 안내해요.";
    case "gangnam": return "세련된 정장의 버디가 트렌디한 강남을 소개합니다.";
    default: return "버디가 서울을 안내해드려요!";
  }
}
