# 🗺 Master Skill Index (Router)
이 프로젝트는 도메인별로 분리된 하위 디렉토리의 스킬과 스크립트를 참조한다.

## 🪝 Active Hooks
- **[Research/Phase 0]** "아이디어 있어", "무엇을 만들까?" -> `/.skills/research/prompt-research.md`
- **[Planning/PRD]** "PRD 만들어줘", "체크리스트 필요해" -> `/.skills/planning/prd-architect.md`
- **[Development/Coding]** "개발 시작하자", "병렬 처리해" -> `/.skills/development/dev-orchestrator.md`
- **[Infrastructure/Deploy]** "배포하자", "도메인/포트/SSE 설정해" -> `/.skills/infrastructure/infra-expert.md`
- **[Git/Release]** "커밋해", "푸시해" -> `/.skills/git-management/git-master.md`
- **[Debugging/RCA]** "왜 안 돼?", "로그 확인해", "콘솔 봐" -> `/.skills/debugging/root-cause-analyst.md`
- **[Documentation/Doc]** "README 만들어", "문서화해" -> `/.skills/documentation/doc-master.md`

## 🧠 Execution Rule
1. 각 태스크 수행 전 해당 도메인 디렉토리의 `.md` 파일을 읽어 페르소나를 확정한다.
2. 실행이 필요한 경우 디렉토리 내의 `.yaml` 또는 `.sh` 파일을 도구로 사용하여 자동화한다.
3. **Efficiency:** 인덱스를 먼저 읽어 필요한 스킬 파일만 선별적으로 로드한다.
