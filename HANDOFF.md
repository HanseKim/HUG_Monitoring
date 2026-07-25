# 인수인계 — 온전(ONJEON) 프론트 작업 상태

> 최종 갱신 2026-07-25. 다음 세션이 이 문서만 읽고 이어받을 수 있게 작성.
> 함께 읽을 것: [PRODUCT.md](PRODUCT.md)(제품 진실·플로우), [DESIGN.md](DESIGN.md)(v2 비주얼 월드), [TESTING.md](TESTING.md)(탭별 테스트 입력).

## 프로젝트 한 줄
HUG 내부 전세보증 리스크 관제 콘솔. Vite+React18+TS+Tailwind, FSD, TanStack Query+Zustand, Recharts, papaparse, MSW 목킹. 저장소 `~/Desktop/HUG_Monitoring` (github.com/HanseKim/HUG_Monitoring, main).

## 현재 IA (플로우 = 내비게이션)
`/` 플로우 개요(닫힌 루프 현황판) · `/assess` 심사·등급(01) · `/monitor` 상시 모니터링(02, **대표 화면**) · `/policy` 정책 인사이트(03) · `/recovery` 회수 전략(04).
구 `/tenant`(임차인 셀프진단)는 제거 — 새 플로우는 HUG 내부 관점. `/tenant`·`/underwrite`는 `/assess`로 리다이렉트. `POST /api/tenant/score` 목 핸들러는 API 계약 유지용으로 남아 있음.

## 디자인 규칙 (지켜야 함)
- 다크 네이비 관제 레일(사이드바) + 밝은 캔버스. 레일 = 파이프라인 다이어그램(스테이지 노드 + 플로우 라인 + 점선 환류).
- IBM Plex Sans KR, **수치는 전부 `.num` 유틸(IBM Plex Mono)**. 그림자 금지, 카드 radius 12/보더 1px.
- 등급색은 3단계 신호등(idx 0~5 초록 / 6~7 주황 / 8~12 빨강) + **항상 글자 등급 병기**.
- 스테이지 색은 해당 스테이지 안에서만. 등급색과 혼용 금지.
- **사용자가 두 번 "AI틱하다"고 반려함.** 금지: 4분할 큰 숫자 카드 나열, 카드 안 카드, 큰 채움 버튼 남발, 통짜 컬러 배너. 대신 헤어라인 구획·워크리스트 행·아웃라인 버튼.
- 디자인 스킬 4종이 `.agents/skills`에 설치돼 있음(frontend-design, impeccable, design-taste-frontend, brandkit). UI 작업 전 로드 권장. **git 추적 제외됨**(용량) — 없으면 재설치.

## 모델1 13등급 (2026-07 개편 반영 완료)
- 소스: [src/shared/config/grades.ts](src/shared/config/grades.ts) — GRADE13 테이블, `gradeFromPd`, `gradeByIdx`, `gradeDelta`.
- **정렬·비교·델타는 반드시 `gradeIdx`(숫자)로.** 문자열 파싱 금지. 경계값(BBB=5%, BB=10%) 임의 조정 금지.
- 하드룰: HR0(전세가율>100%) → 강제 D / HR1(선순위) → 1등급 강등 / HR3 → 등급 미반영.
- API 신필드: `grade13`, `gradeIdx`, `gradeBand`, `gradeReason`(사람이 읽는 문장, 화면에 그대로 노출).
- 기존 3단계 필드는 하위 호환으로 계속 옴.

## 회수 경로 네이밍
API `path` 값은 백엔드 합의 계약이라 `"셀프낙찰"` 유지. **화면 표시는 `PATH_LABEL`/`pathLabel()`로 "든든전세"로 매핑** ([src/entities/recovery-case/types.ts](src/entities/recovery-case/types.ts)). 새로 path를 렌더할 때 반드시 `pathLabel()` 경유.

## 데모 동작 (PPT용 — 유지할 것)
- **모든 탭 진입 즉시 결과 표시.** 심사·회수 탭은 세종 목데이터로 자동 심사/판정.
  구현: `useEffect` + `setTimeout(..., 400)` — 부팅 직후 fetch는 MSW 워커 활성화 레이스로 응답이 유실됨. **이 지연 제거하면 스켈레톤에서 멈춤.**
- 기준 지역 기본값 세종/세종시(발제사 실데이터가 세종뿐, 나머지는 합성 목데이터).
- 모니터링 → 회수 전략 원클릭 연계: 위험구간(idx≥8 또는 투기등급 진입) 강등 건에 `회수 전략 →` 버튼. router state로 계약 전달 → 회수 탭이 프리필+자동판정+연계 배너.
- 연계 시나리오가 경로별로 갈리도록 `LINK_OVERRIDES`([src/pages/recovery/RecoveryPage.tsx](src/pages/recovery/RecoveryPage.tsx)):
  세종 0007 → 든든전세 / 화곡동 0042 → 든든전세 / 주안동 0117 → 배당대기(대항력 유) / 부천 0233 → 협의매입(5회 유찰).

## 모니터링 대표 화면 — 포트폴리오 요약 + 경제성 지표 + PDF (완료)
사용자 요구: "HUG가 원하는 건 예상손실액이 얼마고, 회수율이 어떻게 바뀌고, 회수전략이 어떻게 바뀌었는지. 맨 위에 전체 데이터 기반 총 예상손실액·회수율·든든전세 몇 채·등급별 요약을 다 담고, PDF로 뽑을 수 있게."

구현된 것:
- `GET /api/monitor/portfolio` 목 핸들러 + `PortfolioSummary` 타입 + `usePortfolioSummary()`.
  목 수치: 계약 12,480건 / 익스포저 3조 1,815억 / 올해 EL 1,284억(실현 946억) / 이번달 EL 218억(전월비 +37억) /
  실현 회수율 74.2%(전월비 +2.4%p, 예측 75.4%) / 평균 8.4개월 /
  등급 분포 투자 9,111건(73%)·투기 3,369건(27%), AAA 749 … D 36 (통지문 §6 실측 분포 준수) /
  경로: 든든전세 142채·배당대기 386·협의매입 47·캠코공매 18·재산추적 9.
- [src/widgets/portfolio-summary/](src/widgets/portfolio-summary/) — 다크 패널: 핵심 수치 4 → 13등급 분포 막대 → 경로 분포.
- 행(`MonitorRow`) 2단 구조: 1단 식별·등급 트랙·액션 / 2단 3분할 델타 블록(예상손실 EL · 예상 회수율 · 회수 전략, 전→후 + 증감).
  스냅샷 경제성은 목에서 계산: `lgd = clamp(0.05,0.95, 1 - 0.78/(ratio/100) + 0.08)`, `recoveryRate = (1-lgd)*100`, `el = pd/100*lgd*deposit`.
- `[PDF로 저장]`(window.print) + 인쇄 전용 표지(`hidden print:block`) + `@media print`(A4 landscape, print-color-adjust exact, break-inside avoid, 레일/버튼 숨김).

## 배포 (Vercel)
- **원격이 초기 커밋 상태였음** — 로컬 13개 커밋 미푸시가 404 NOT_FOUND의 원인이었다. 확인: `git log origin/main..HEAD`.
- [vercel.json](vercel.json) 추가됨(framework vite, outputDirectory dist, SPA rewrites). 프레임워크가 Other로 감지되면 output이 `public/`(index.html 없음)으로 잡혀 404가 남.
- 푸시: `git push origin main`. Vercel Settings → Root Directory는 비워둘 것.
- `.env`의 `VITE_USE_MSW=true`가 커밋돼 있어 배포판도 목데이터로 동작(데모 의도). 실서버 전환은 Vercel 환경변수에서 `VITE_USE_MSW=false` + `VITE_API_BASE_URL`.

## 알려진 함정
- 로고는 사용자가 직접 넣은 `src/shared/ui/ONJEON_LOGO.png`를 Sidebar에서 직접 import. **건드리지 말 것.**
- Tailwind 동적 클래스 조합 금지 — 탭/스테이지 색은 [src/shared/config/tabs.ts](src/shared/config/tabs.ts)의 정적 클래스 매핑 사용.
- MSW 스테일 HMR: 모듈 그래프가 깨지면 dev 서버 재시작(포트 5173 점유 프로세스 kill 후 재시작)해야 함.
- 목 응답 지연 800~1500ms는 의도된 것(스켈레톤 데모).
