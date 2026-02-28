"use client";

// 마스코트 채팅 컴포넌트

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, useCurrentDistrict } from "@/store/gameStore";
import { chatWithMascot } from "@/services/gemini";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function MascotChat() {
  const isChatOpen = useGameStore((state) => state.isChatOpen);
  const toggleChat = useGameStore((state) => state.toggleChat);
  const currentDistrict = useCurrentDistrict();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 지역 변경 시 인사 메시지
  useEffect(() => {
    if (currentDistrict && isChatOpen) {
      const greeting = getDistrictGreeting(currentDistrict.id);
      setMessages([{ role: "assistant", content: greeting }]);
    }
  }, [currentDistrict?.id, isChatOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const reply = await chatWithMascot(
        userMessage,
        currentDistrict?.nameKo || "서울",
        messages
      );
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "앗, 잠시 문제가 생겼어! 다시 물어봐줄래? 😅" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 채팅 토글 버튼 */}
      <motion.button
        onClick={() => toggleChat()}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg z-50 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <span className="text-2xl">{isChatOpen ? "✕" : "💬"}</span>
      </motion.button>

      {/* 채팅 패널 */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 w-80 h-96 bg-black/90 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 z-40 flex flex-col"
          >
            {/* 헤더 */}
            <div className="p-3 border-b border-white/10 bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <span>🐥</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">버디</h3>
                  <p className="text-gray-400 text-xs">
                    {currentDistrict?.nameKo} 가이드
                  </p>
                </div>
              </div>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white rounded-br-sm"
                        : "bg-white/10 text-white rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* 로딩 표시 */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 px-4 py-2 rounded-2xl rounded-bl-sm">
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-gray-400"
                    >
                      입력 중...
                    </motion.span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="버디에게 물어보세요..."
                  className="flex-1 bg-white/10 text-white placeholder-gray-500 px-3 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-yellow-500/50"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>↑</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function getDistrictGreeting(districtId: string): string {
  switch (districtId) {
    case "gyeongbokgung":
      return "어서오게나~ 여기는 조선의 법궁, 경복궁이라네. 궁금한 것이 있으면 물어보거라! 🏯";
    case "itaewon":
      return "Hey~ 이태원에 온 걸 환영해! 여기선 전 세계 문화를 느낄 수 있어! 뭐가 궁금해? 🎉";
    case "hongdae":
      return "안녕~ 홍대에 왔구나! 예술과 자유가 넘치는 곳이야. 뭐든 물어봐! 🎨";
    case "gangnam":
      return "강남에 오신 걸 환영합니다. 서울의 트렌드를 이끄는 곳이죠. 무엇이 궁금하신가요? 🏙️";
    default:
      return "안녕! 나는 버디야~ 서울 여행을 도와줄게! 뭐가 궁금해? 😊";
  }
}
