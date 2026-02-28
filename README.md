# Welcome to Korea 🇰🇷

> **한국 오기 전부터 미리 즐겨보세요** — 한국 문화를 3D로 생생하게 보여주는 지도 서비스

[![Built with Google Maps](https://img.shields.io/badge/Google%20Maps-API-4285F4?logo=googlemaps)](https://developers.google.com/maps)
[![Powered by Gemini](https://img.shields.io/badge/Gemini-AI-8E75B2?logo=google)](https://ai.google.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-Framework-000000?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-98.4%25-3178C6?logo=typescript)](https://www.typescriptlang.org/)

<p align="center">
  <img src="image_press.png" alt="Welcome to Korea" width="600">
</p>

## 문제

해외여행 중 Google Maps 사용 빈번  
Bird's Eye View(위에서 내려다보는 화면)로 낯선 동네 구조 빠른 파악, 길 찾기 도움

한국 Google Maps는 다른 나라와 차이  
보안 규정 영향으로 고정밀 항공/위성 이미지 활용 제한  
그 결과 기능 제한

- ❌ Bird's Eye View 미지원
- ❌ 3D 건물 데이터 제한
- ❌ 이동 동선 파악용 공간 정보 부족

외국인 방문자 기준, 익숙한 지도 경험 부재

## 해결 방법

제한된 항공 이미지 없이 3D 공간 경험 재구성

활용 데이터

- 📍 Street View 이미지
- 🗺️ 좌표/위치 정보
- 🤖 Google Gemini AI(장소 맥락 이해·생성)

단순 길 안내 넘어, 장소 분위기까지 전달하는 3D 지도 경험

## 주요 기능

### 🏛️ 위치 + 분위기

위치만 표시가 아닌, “어떤 느낌의 장소” 전달

| 경복궁 | 홍대 |
|:---:|:---:|
| 한복 아바타 | 거리 예술가 아바타 |
| 차분한 전통 분위기 | 활기찬 젊은 분위기 |
| 역사/궁궐 감성 | 현대/인디 문화 감성 |

장소별 요소

- 분위기 맞춤 아바타 의상
- 장소 맞춤 애니메이션(전통 걸음, 거리 댄스)
- 장소별 건물 텍스처
- 실측 기반 현실 비율 스케일

### 🎯 직접 탐험

- 서울 지도 관광 구역 색상 강조
- 클릭/줌으로 상세 3D 뷰 진입
- 교통, 이동 팁, 기본 매너 정보 제공

## 기술 스택

| 분류 | 기술 |
|----------|------------|
| **Frontend** | Next.js, TypeScript, Tailwind CSS |
| **Maps** | Google Maps Platform API |
| **AI** | Google Gemini |
| **3D Rendering** | Three.js / WebGL |
| **Deployment** | Vercel, Docker |

## 시작하기

### 준비물

- Node.js 18+
- Google Maps API Key
- Google Gemini API Key

### 설치

```bash
# 저장소 클론
git clone https://github.com/gemini-hackerthon-real/welcome-to-korea.git
cd welcome-to-korea

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local에 API 키 입력

# 개발 서버 실행
npm run dev
