import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  const { message, district } = await request.json();

  // API 키가 없으면 mock 응답
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      reply: getMockResponse(message, district),
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
당신은 "버디"라는 귀여운 서울 여행 마스코트입니다.
현재 위치: ${district}

성격:
- 친근하고 유쾌함
- 이모지를 적절히 사용
- 답변은 2-3문장으로 간결하게

지역별 말투:
- 경복궁: 조금 더 품위있게, 옛말 살짝 섞어서
- 이태원: 신나고 활발하게, 영어 살짝 섞어서
- 홍대: 창의적이고 자유롭게
- 강남: 세련되고 프로페셔널하게

사용자 질문: ${message}
`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({
      reply: getMockResponse(message, district),
    });
  }
}

function getMockResponse(message: string, district: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("맛집") || lower.includes("음식") || lower.includes("먹")) {
    switch (district) {
      case "경복궁": return "경복궁 근처엔 삼청동 수제비와 북촌 한정식이 유명하답니다! 🍜";
      case "이태원": return "이태원은 세계 음식 천국이야! 케밥, 타코, 버거 뭐든 있어~ 🌮";
      case "홍대": return "홍대는 떡볶이 골목이랑 연남동 브런치 카페 추천! 🥞";
      case "강남": return "강남역 맛집은 압구정 로데오 쪽 파인다이닝 추천드려요. 🍷";
    }
  }

  if (lower.includes("볼거리") || lower.includes("관광") || lower.includes("뭐해")) {
    switch (district) {
      case "경복궁": return "수문장 교대식은 꼭 보세요! 경회루 야경도 아름답답니다. 🏯";
      case "이태원": return "해방촌 언덕에서 보는 서울뷰 최고야! 밤엔 클럽거리도! 🌃";
      case "홍대": return "버스킹 거리랑 벽화골목 산책 추천해~ 프리마켓도 재밌어! 🎸";
      case "강남": return "코엑스 별마당 도서관이랑 봉은사 산책 코스 추천이에요. 📚";
    }
  }

  switch (district) {
    case "경복궁": return "경복궁에 오신 걸 환영하오~ 무엇이든 물어보시게나! 🏯";
    case "이태원": return "Hey~ 이태원에서 뭐든 물어봐! 내가 다 알려줄게! 🎉";
    case "홍대": return "홍대 버디야~ 궁금한 거 있으면 편하게 물어봐! 🎨";
    case "강남": return "강남 가이드 버디입니다. 무엇을 도와드릴까요? 💼";
    default: return "안녕! 뭐든 물어봐~ 😊";
  }
}
