# 🚀 배포 가이드 (Deployment Guide)

이 문서는 Vercel(프론트엔드)과 GCP(백엔드/API) 배포를 위한 가이드입니다.

## 1. Vercel 배포 (프론트엔드)

Vercel은 Next.js 어플리케이션의 프론트엔드와 Edge Functions를 호스팅합니다.

1.  **Vercel CLI 설치**: `npm install -g vercel`
2.  **프로젝트 루트에서 실행**: `vercel`
3.  **환경 변수 설정**: Vercel Dashboard에서 다음 변수들을 추가하세요.
    *   `GEMINI_API_KEY`
    *   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
    *   `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`
    *   `NEXT_PUBLIC_BACKEND_URL` (GCP 백엔드 URL을 사용할 경우)
4.  **프로덕션 배포**: `vercel --prod`

## 2. GCP Cloud Run 배포 (백엔드/전체)

GCP Cloud Run은 Docker 이미지를 사용하여 서버를 구동합니다. 현재 루트에 있는 `Dockerfile`을 사용합니다.

### 방법 A: Cloud Build 사용 (추천)
준비된 `skiils1/infrastructure/cloudbuild.yaml`을 사용하여 자동 빌드 및 배포를 수행합니다.

```bash
gcloud builds submit --config skiils1/infrastructure/cloudbuild.yaml 
  --substitutions=_SERVICE_NAME=seoul-birds-eye-backend
```

### 방법 B: 직접 배포
```bash
# 이미지 빌드 및 푸시 (Artifact Registry)
gcloud builds submit --tag asia-northeast3-docker.pkg.dev/[PROJECT_ID]/[REPO_NAME]/app:latest .

# Cloud Run 배포
gcloud run deploy seoul-birds-eye-backend 
  --image asia-northeast3-docker.pkg.dev/[PROJECT_ID]/[REPO_NAME]/app:latest 
  --region asia-northeast3 
  --allow-unauthenticated 
  --set-env-vars="GEMINI_API_KEY=[YOUR_KEY],PORT=8080"
```

## 3. 하이브리드 구성 (Vercel Front + GCP Back)

만약 프론트엔드는 Vercel에서 쓰고, API만 GCP를 사용하고 싶다면:
1.  Cloud Run 배포 후 생성된 URL을 복사합니다.
2.  프론트엔드 코드의 서비스 호출 부분(예: `src/services/gemini.ts`)에서 API 엔드포인트를 Cloud Run URL로 변경하거나, `next.config.mjs`의 `rewrites` 설정을 통해 프록시합니다.

---
**주의**: 배포 전에 `.env` 파일의 API 키들이 올바르게 설정되어 있는지 확인하세요.
