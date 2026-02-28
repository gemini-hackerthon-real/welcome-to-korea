// Gemini API 서비스

import { GoogleGenerativeAI } from "@google/generative-ai";

// 클라이언트 사이드에서는 API 라우트를 통해 호출
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL 
  ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gemini` 
  : "/api/gemini";

// 텍스트 생성 (POI 설명, 가이드 등)
export async function generateNarration(prompt: string): Promise<string> {
  const response = await fetch(`${API_BASE}/narrate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate narration");
  }

  const data = await response.json();
  return data.text;
}

// 이미지 생성 (건물 텍스처)
export async function generateTexture(
  buildingType: string,
  districtStyle: string,
  colorPalette: string[]
): Promise<string> {
  const response = await fetch(`${API_BASE}/texture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      buildingType,
      districtStyle,
      colorPalette,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate texture");
  }

  const data = await response.json();
  return data.imageUrl;
}

// 마스코트 대화 (챗봇)
export async function chatWithMascot(
  message: string,
  districtContext: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      districtContext,
      conversationHistory,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get mascot response");
  }

  const data = await response.json();
  return data.reply;
}

// 서버 사이드 전용 - Gemini 클라이언트 초기화
export function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(apiKey);
}

// 서버 사이드 - 텍스트 생성
export async function serverGenerateText(prompt: string): Promise<string> {
  const genAI = createGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

// 서버 사이드 - 이미지 생성 프롬프트 구성
export function buildTexturePrompt(
  buildingType: string,
  districtStyle: string,
  colorPalette: string[]
): string {
  return `
    Create a stylized, game-ready texture for a ${buildingType} building.
    Style: ${districtStyle}
    Color palette: ${colorPalette.join(", ")}

    Requirements:
    - Isometric view suitable for 3D mapping
    - Artistic and stylized, not photorealistic
    - Clear architectural details
    - Suitable for a cultural exploration game
    - Korean cultural elements where appropriate
  `.trim();
}
