import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "서울 버드아이 | Seoul Bird's Eye",
  description: "AI가 그린 서울의 문화 지도 - Gemini 해커톤 프로젝트",
  keywords: ["서울", "지도", "3D", "Gemini", "AI", "문화", "여행"],
  authors: [{ name: "Seoul Bird's Eye Team" }],
  openGraph: {
    title: "서울 버드아이 | Seoul Bird's Eye",
    description: "보안 제한을 창의성으로 극복한 AI 문화 지도",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
