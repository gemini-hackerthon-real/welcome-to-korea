// Gemini 나레이션 생성 API

import { NextRequest, NextResponse } from "next/server";
import { serverGenerateText } from "@/services/gemini";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `
      당신은 서울의 문화와 역사를 안내하는 친근한 가이드입니다.
      사용자의 질문에 재미있고 유익하게 답변해주세요.
      답변은 2-4문장으로 간결하게 해주세요.
      한국어로 답변하되, 필요시 영어 단어를 섞어도 됩니다.
    `;

    const fullPrompt = `${systemPrompt}\n\n사용자 요청: ${prompt}`;
    const text = await serverGenerateText(fullPrompt);

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Narration generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate narration" },
      { status: 500 }
    );
  }
}
