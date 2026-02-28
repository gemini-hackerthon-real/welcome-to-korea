// Gemini Vision API를 사용한 스크린샷 분석 엔드포인트

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getPreset, SUPPORTED_PLACES } from "@/data/cameraPresets";
import { AnalysisResult, ViewType } from "@/types/camera";

const VISION_PROMPT = `당신은 서울 관광지 이미지 분석 전문가입니다. 이 이미지를 분석하여 어느 서울 관광지인지, 어떤 뷰 타입인지 판단해주세요.

지원하는 장소:
- gyeongbokgung (경복궁): 근정전, 광화문, 경회루, 향원정 등 조선시대 궁궐
- hongdae (홍대): 버스킹존, 걷고싶은거리, 클럽거리, 카페, 벽화 등 젊은이 문화 거리
- itaewon (이태원): 해밀턴호텔, 세계음식거리, 클럽, 네온사인, 언덕길 등 국제적 거리
- gangnam (강남): 고층빌딩, 테헤란로, 강남역, 현대적 스카이라인

뷰 타입:
- front: 건물/랜드마크 정면 뷰
- aerial: 위에서 내려다보는 조감도
- street: 거리 수준의 원근감 있는 뷰
- hill: 언덕에서 내려다보는 뷰 (특히 이태원)
- panoramic: 넓은 전경 뷰
- closeup: 특정 건물/요소 근접 뷰

응답 형식 (JSON만 반환):
{
  "place_id": "gyeongbokgung" | "hongdae" | "itaewon" | "gangnam" | "unknown",
  "place_name": "경복궁",
  "view_type": "front" | "aerial" | "street" | "hill" | "panoramic" | "closeup",
  "landmarks": ["근정전", "광화문"],
  "confidence": 0.85
}

이미지를 분석하고 JSON만 반환하세요.`;

// 시도할 모델 목록 (fallback 순서)
const MODELS_TO_TRY = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash-lite-001",
  "gemini-2.0-flash",
];

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "이미지가 필요합니다" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY가 설정되지 않았습니다" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // base64에서 데이터 URL 프리픽스 제거
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    let text = "";
    let lastError: Error | null = null;

    // 여러 모델 시도 (fallback)
    for (const modelName of MODELS_TO_TRY) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent([
          VISION_PROMPT,
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          },
        ]);

        const response = result.response;
        text = response.text();
        console.log(`Success with model: ${modelName}`);
        break; // 성공하면 루프 종료
      } catch (err) {
        console.log(`Model ${modelName} failed:`, (err as Error).message);
        lastError = err as Error;
        continue; // 다음 모델 시도
      }
    }

    if (!text && lastError) {
      throw lastError;
    }

    // JSON 파싱 (마크다운 코드블록 제거)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "분석 결과를 파싱할 수 없습니다" },
        { status: 500 }
      );
    }

    const analysisData = JSON.parse(jsonMatch[0]);

    // 유효한 장소인지 확인
    const validPlace = SUPPORTED_PLACES.find(
      (p) => p.id === analysisData.place_id
    );

    if (!validPlace || analysisData.place_id === "unknown") {
      return NextResponse.json({
        place_id: "unknown",
        place_name: "알 수 없는 장소",
        view_type: "front" as ViewType,
        landmarks: [],
        confidence: 0,
        camera_preset: undefined,
      } as AnalysisResult);
    }

    // 해당 프리셋 찾기
    const preset = getPreset(analysisData.place_id, analysisData.view_type);

    const analysisResult: AnalysisResult = {
      place_id: analysisData.place_id,
      place_name: analysisData.place_name || validPlace.nameKo,
      view_type: analysisData.view_type as ViewType,
      landmarks: analysisData.landmarks || [],
      confidence: analysisData.confidence || 0.5,
      camera_preset: preset,
    };

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "이미지 분석 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
