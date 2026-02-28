"use client";

// 로딩 화면 컴포넌트

import { motion } from "framer-motion";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "로딩 중..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center z-50">
      {/* 마스코트 실루엣 애니메이션 */}
      <motion.div
        className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-8"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 로딩 텍스트 */}
      <motion.h2
        className="text-2xl font-bold text-white mb-4"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        서울 버드아이
      </motion.h2>

      <p className="text-gray-400">{message}</p>

      {/* 로딩 바 */}
      <div className="w-64 h-1 bg-gray-700 rounded-full mt-8 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}
