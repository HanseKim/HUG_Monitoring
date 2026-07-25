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

## 모델1 위험등급 — 19등급 (AAA~C) ★현행
- 소스: [src/shared/config/grades.ts](src/shared/config/grades.ts) — `GRADE_SCALE`(19개), `gradeFromPd`, `gradeByIdx`, `gradeDelta`, `isWatch`, `WATCH_START=10`.
- 등급 순서: AAA·AA+·AA0·AA-·A+·A0·A-·BBB+·BBB0·BBB- (투자등급, idx 0~9) / **BB+·BB0·BB-·B+·B0·B-·CCC·CC·C (워치리스트, idx 10~18)**.
- 각 등급에 **2024 시험셋 실측치**(testCount, actualRate, predictedPd)가 상수로 박혀 있음 — 대시보드가 이걸 그대로 씀.
- `maxPd`는 **모델 정본 경계표**(`~/Downloads/dive 데이터/등급판정모델/code/run.py`의 `GRADE_BANDS`)를 옮긴 값.
  판정도 모델 `to_grade()`와 동일하게 `lo <= pd < hi`(상한 미만). 경계 변경 시 모델 코드와 함께 고칠 것.
  ⚠ 같은 폴더의 `dive 데이터/grade_scale.py`는 **구버전 13등급(AAA~D)** 이라 참조하지 말 것 — 정본은 `등급판정모델/code/run.py`.
- 정렬·비교·델타는 반드시 `idx`(숫자)로. 문자열 파싱 금지.
- 이전 13등급(AAA~D) 체계는 폐기됨. `GRADE13`은 하위 호환 별칭으로만 남아 있음.
- 색 매핑: legacy 3구간(안심 idx 0~6 / 주의 7~12 / 위험 13~18) — 실측 사고율 기준으로 나눔.

## 회수 경로 네이밍
API `path` 값은 백엔드 합의 계약이라 `"셀프낙찰"` 유지. **화면 표시는 `PATH_LABEL`/`pathLabel()`로 "든든전세"로 매핑** ([src/entities/recovery-case/types.ts](src/entities/recovery-case/types.ts)). 새로 path를 렌더할 때 반드시 `pathLabel()` 경유.

## 데모 동작 (PPT용 — 유지할 것)
- **모든 탭 진입 즉시 결과 표시.** 심사·회수 탭은 세종 목데이터로 자동 심사/판정.
  구현: `useEffect` + `setTimeout(..., 400)` — 부팅 직후 fetch는 MSW 워커 활성화 레이스로 응답이 유실됨. **이 지연 제거하면 스켈레톤에서 멈춤.**
- 기준 지역 기본값 세종/세종시(발제사 실데이터가 세종뿐, 나머지는 합성 목데이터).
- 모니터링 → 회수 전략 원클릭 연계: 위험구간(idx≥8 또는 투기등급 진입) 강등 건에 `회수 전략 →` 버튼. router state로 계약 전달 → 회수 탭이 프리필+자동판정+연계 배너.
- 연계 시나리오가 경로별로 갈리도록 `LINK_OVERRIDES`([src/pages/recovery/RecoveryPage.tsx](src/pages/recovery/RecoveryPage.tsx)):
  세종 0007 → 든든전세 / 화곡동 0042 → 든든전세 / 주안동 0117 → 배당대기(대항력 유) / 부천 0233 → 협의매입(5회 유찰).

## 모니터링 대표 화면 — 모델 산출물 전용 (현행)
**원칙**: 모델1이 산출하지 않는 값은 화면에 올리지 않는다.
금지(재도입 X): 예상손실 EL · 회수율 · 회수 소요기간 · 회수액 · 경로별 회수액 · 보증금 기반 금액 지표 · 손으로 쓴 권고문.
허용: 등급 분포, 실측 사고율, 예측 PD, 성능지표(AUC/AP/Brier/단조성), 워치리스트 집중도, **모델 입력 피처**(전세가율·선순위비율·adj/rel 전세가율).

- `GET /api/monitor/portfolio` → `ModelDashboard` 타입, 훅 `useModelDashboard()`. 목데이터는 전부 `GRADE_SCALE` 실측 상수에서 생성.
- [src/widgets/model-dashboard/](src/widgets/model-dashboard/) 배치(위→아래):
  1. **다크 패널 = 등급별 계약 분포** (19개 막대 + 건수). 투자등급은 중립 회청색, 워치리스트만 등급색으로 대비.
     하단 축에 투자등급/워치리스트 구간 표시, 그 아래 4지표(워치 사고율 18.4% · 포착률 83.8% · AUC 0.8595 · 단조성 0.9938).
  2. **등급별 실제 사고율**(라이트): 막대=실측 사고율, 점=예측 PD.
  3. **위험 순 열람 시 사고 포착**(누적 곡선) + **등급별 분포 상세표**(실제÷예측).
  - 이전에 있던 "하위 34.6%…83.8% 발생" 헤드라인 + 계약/사고 비중 비교막대는 사용자 요청으로 삭제됨.
- 행(`MonitorRow`) 2단 블록 = **모델 예측 PD** 전→후 / **동일등급 실측 사고율** 전→후 / **모델 입력 변화**(전세가율·선순위비율).
  보증금 표기·권고문·회수 전략 블록은 제거됨. 강등 사유 문구도 모델 피처 변화로 서술.
  트리거 T2는 '금리'가 모델 피처가 아니므로 '시장지수'로 표기.
- `[PDF로 저장]` + 인쇄 표지 + `@media print`(A4 landscape, 색상 유지, 행 분할 방지).

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
