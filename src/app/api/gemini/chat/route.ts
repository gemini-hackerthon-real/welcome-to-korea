// Gemini 마스코트 채팅 API

import { NextRequest, NextResponse } from "next/server";
import { createGeminiClient } from "@/services/gemini";

export async function POST(request: NextRequest) {
  try {
    const { message, districtContext, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const genAI = createGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
      당신은 "버디"라는 이름의 귀여운 서울 여행 마스코트입니다.
      현재 위치: ${districtContext || "서울"}

      성격:
      - 친근하고 유쾌함
      - 서울의 문화와 역사에 대해 해박함
      - 이모지를 적절히 사용함
      - 답변은 2-3문장으로 간결하게

      현재 지역에 맞는 성격으로 답변하세요:
      - 경복궁: 조금 더 차분하고 품위있게
      - 이태원: 신나고 활발하게
      - 홍대: 창의적이고 자유롭게
      - 강남: 세련되고 프로페셔널하게
    `;

    // 대화 기록 포맷팅
    const formattedHistory = conversationHistory?.map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    })) || [];

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "안녕! 나는 버디야~ 서울 여행을 도와줄게! 🎉" }],
        },
        ...formattedHistory,
      ],
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
