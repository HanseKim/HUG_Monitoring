# 온전(ONJEON) — 프론트엔드 웹 스펙

> DIVE 2026 · HUG × 아이엔 | 프론트 파트
> 서비스명: **온전 (ONJEON)** — "전세의 처음부터 끝까지, 온전하게."

## 1. 확정 사항 요약

| 항목 | 결정 |
|---|---|
| 스택 | Vite + React 18 + TypeScript + Tailwind CSS |
| 아키텍처 | FSD (Feature-Sliced Design) |
| 상태관리 | TanStack Query(서버) + Zustand(UI) |
| 차트 | Recharts |
| CSV | papaparse — 프론트 파싱 + 미리보기 테이블 + 컬럼 검증 후 건별 API 호출 |
| 모델 연동 | REST API 스키마 고정(§6) + MSW로 목킹. `.env`의 `VITE_API_BASE_URL` 교체만으로 실서버 전환 |
| 라우팅 | react-router-dom, 탭별 URL: `/tenant` `/underwrite` `/monitor` `/recovery` |
| 로그인 | 없음 |
| 반응형 | 데스크톱 우선(1280px+ 최적화, 태블릿까지 안 깨지게, 모바일 미대응) |
| 폰트 | Pretendard (CDN, 400/700 두 웨이트만) |
| 인쇄 | 든든전세 탭 결과 레포트에 print CSS + "PDF로 저장" 버튼(window.print) |

## 2. 디자인 시스템

원칙: **플랫·무그림자, 쿨그레이 캔버스 위 흰 카드, 헤어라인 구분, Pretendard 700/400 두 웨이트로 위계, 절제된 단일 액션 컬러.**

### 2.1 컬러 토큰 (tailwind.config 확장)

```js
colors: {
  canvas: "#f1f3f5", surface: "#ffffff",
  ink: "#1d2024", slate: "#3c3c3c", body: "#606060",
  label: "#4b525a", muted: "#858d94", faint: "#9ca5ad",
  divider: "#dee3e8", hairline: "#d2d2d2",
  primary: { DEFAULT: "#1268CC", soft: "#EAF2FC" },
  tenant:    { DEFAULT: "#16A34A", soft: "#E8F7EE" },
  underwrite:{ DEFAULT: "#1268CC", soft: "#EAF2FC" },
  monitor:   { DEFAULT: "#5EA8E5", soft: "#EFF8FE" },
  recovery:  { DEFAULT: "#0B3B7A", soft: "#E9EFF7" },
  grade: {
    safe:    { DEFAULT: "#16A34A", soft: "#E8F7EE" },
    caution: { DEFAULT: "#F59E0B", soft: "#FEF5E7" },
    danger:  { DEFAULT: "#DC2626", soft: "#FDECEC" },
  },
}
```

규칙: 등급색은 항상 **글자 등급과 병기**. 탭 액센트는 해당 탭 안에서만 사용, 등급색과 혼용 금지.

### 2.2 타이포·형태·모션

- 히어로 수치 40px/400/-0.9px slate, 섹션제목 24px/700/-0.6px ink, 본문 14px/400 body
- 카드: 흰 배경, radius 10px, border 1px divider, **그림자 없음**
- 버튼 primary: 탭 액센트색 bg + 흰 글자, radius 8px, 16px/700
- 입력: 흰 bg, 1px hairline, radius 4px, focus 시 해당 탭 액센트색
- 모션: 120/200/320ms. 스켈레톤은 divider색 플랫 펄스(쉬머 금지)
- 로딩: "검사하기" 클릭 → 버튼 스피너 + 결과영역 스켈레톤 카드(최종 레이아웃과 동일 치수) 1~1.5초(목 딜레이) → 결과 fade-in(200ms)

## 3. 레이아웃 뼈대

- 좌측 사이드바 240px 고정, 흰 배경. 상단 "온전" 워드마크(ink 700), 4개 탭 메뉴.
- 활성 탭: 좌측 3px 액센트바 + soft bg + 700. 비활성: faint 400.
- 사이드바 하단: "DIVE 2026 · HUG × 아이엔" muted 12px
- 메인: max-w-[1200px] mx-auto, canvas 배경
- 각 탭 상단 공통 헤더: 탭 제목(24px/700) + 한 줄 설명(14px body) + 해당 탭 soft색 얇은 배너

## 4. 탭별 화면 스펙

### 4.1 `/tenant` 임대차계약 (액센트: 초록)

**상단 — 입력 카드** (흰 카드 1장, 2열 그리드)
- 필수: 주소, 주택유형(아파트/다세대주택/연립주택/오피스텔/기타), 전세보증금(원, 콤마 자동포맷)
- 선택("상세 정보 입력" 아코디언): 전용면적(㎡), 선순위권리(없음/근저당설정/압류·가압류/선순위존재/미상), 보증보험(가입/미가입/미상), 전세대출 이용예정(토글)
- 하단 우측 [검사하기] 버튼 (tenant색). 필수 미입력 시 비활성+안내문

**하단 — 결과 대시보드**
1. 등급 히어로 카드: 등급 배지(안심/주의/위험) + 위험도 수치 40px + 전세가율·주택가액 보조 수치 + 반원 게이지(RadialBarChart)
2. 체크리스트 카드: HR 항목별 행 — 발동 시 danger soft bg + ⚠ + 근거문, 미발동 시 체크 + muted
3. 유사 사례 카드: RAG 인용 2~3건, 인용문 스타일(좌측 3px 보더) + "지역×유형×보증금구간 기준" 캡션
4. 보험 추천 카드: 등급별 분기. 항상 "실제 승인 여부는 HUG 심사에서 최종 결정됩니다" 각주
5. 비교 차트 카드: 전세가율별 위험도 곡선(LineChart) + 내 위치 점 + 대안 시나리오 1줄

### 4.2 `/underwrite` HUG 계약 심사 (액센트: HUG 블루)

- 입력 모드 토글(세그먼티드): 직접 입력 | CSV 업로드
- 직접 입력: 신청ID(자동생성 가능), 시도/시군구, 주택유형, 전용면적, 신청보증금, 주택가액, 선순위금액, 신청시점(date) → [심사하기]
- CSV: 드롭존 → papaparse 파싱 → 미리보기 테이블(최대 10행, "외 N건") + 컬럼 검증 → [N건 일괄 심사]
- 단건 결과: 판정 히어로(승인 safe색/거절 danger색) + 근거 bullet + 4스탯 타일(PD/LGD/EAD/EL, EL은 예상보험료와 비교 막대) + 근거 리스트
- 일괄: 요약 스탯 행 + 결과 테이블(행 클릭 → 슬라이드오버 상세)

### 4.3 `/monitor` 모니터링 (액센트: 연한 블루)

- 검색바(주소·계약ID) + 필터 칩(전체/등급하락만/경보만) — 기본은 "변동 있음"만, 검색 시 무변동도 노출
- 요약 스탯 행: 관리중 계약 수 / 이번달 등급하락 / 경보
- 변동 카드: 좌(전, muted) → 우(후, 등급색 강조) 비교, 등급 하락 카드는 상단 3px danger 보더
- 트리거 배지: T1 정기 / T2 금리(경보만) / T3 등기변동 / T4 지역리스크

### 4.4 `/recovery` 든든전세 (액센트: 진한 네이비)

- 입력: 단건 직접입력 | CSV 토글. 필드: 사건번호, 주소, 주택유형, 전용면적, 대위변제액, 선순위금액, 감정가, 최저매각가, 유찰횟수, 명도상태, 하자상태, 대항력임차인
- 결과 = 레포트 형식: 헤더 + 판정 히어로(경로+점수) + E[자산화] vs E[배당] 막대 + 게이트 테이블 + 시나리오 3종 + 근거 bullet + [PDF로 저장](window.print, @media print로 사이드바·입력부 숨김)
- 일괄: 경로별 분포 도넛 + 테이블, 행 클릭 → 단건 레포트

## 5. FSD 구조

```
src/
├── app/            # providers, 전역 스타일, MSW 부트스트랩
├── pages/          # tenant / underwrite / monitor / recovery (조립만)
├── widgets/        # sidebar, grade-hero, checklist-card, similar-cases, insurance-reco,
│                   # risk-curve-chart, verdict-hero, stat-tiles, batch-table,
│                   # monitor-card, recovery-report
├── features/       # tenant-form, underwrite-form, csv-upload, monitor-search, report-print
├── entities/       # assessment, contract, recovery-case
└── shared/         # ui, api, lib, config
```

의존 방향: shared → entities → features → widgets → pages → app (역방향 금지).

## 6. API 스키마 (고정 — 임의 변경 금지)

```typescript
// POST /api/tenant/score
type TenantScoreReq = {
  address: string; houseType: "아파트"|"다세대주택"|"연립주택"|"오피스텔"|"기타";
  deposit: number; areaM2?: number;
  seniorLien?: "없음"|"근저당설정"|"압류·가압류"|"선순위존재"|"미상";
  insurance?: "가입"|"미가입"|"미상"; hasLoan?: boolean;
};
type TenantScoreRes = {
  grade: "안심"|"주의"|"위험"; riskPct: number; jeonseRatio: number;
  housePrice: number | null;
  checklist: { id: "HR0"|"HR1"|"HR2"|"HR3"; fired: boolean; title: string; evidence: string }[];
  similarCases: { region: string; summary: string; disputeType: string }[];
  insuranceReco: { type: "recommend"|"conditional"|"warning"; product: string|null; message: string };
  curve: { ratio: number; riskPct: number }[];
};
// POST /api/underwrite/score
type UnderwriteReq = {
  applicationId?: string; sido: string; sigungu: string;
  houseType: string; areaM2: number; deposit: number;
  housePrice: number; seniorAmount: number; appliedAt: string;
};
type UnderwriteRes = {
  verdict: "승인"|"거절"; pdPct: number; lgdPct: number;
  ead: number; el: number; expectedPremium: number;
  reasons: string[]; jeonseRatio: number;
};
// GET /api/monitor/contracts?changed=true|false&q=검색어
type MonitorContract = {
  contractId: string; address: string; houseType: string;
  before: { grade: string; riskPct: number; jeonseRatio: number; snapshotAt: string };
  after:  { grade: string; riskPct: number; jeonseRatio: number; snapshotAt: string } | null;
  trigger: "T1_정기"|"T2_금리"|"T3_등기변동"|"T4_지역리스크" | null;
  reason: string | null; recommendations: string[];
};
// POST /api/recovery/analyze
type RecoveryReq = {
  caseNo?: string; address: string; houseType: string; areaM2: number;
  subrogationAmount: number; seniorAmount: number;
  appraisalPrice: number; minBidPrice: number; failedBidCount: number;
  evictionStatus?: "양호"|"점유중"|"미상"; defectStatus?: "양호"|"경미"|"보수필요"|"미상";
  opposableTenant?: "유"|"무"|"미상";
};
type RecoveryRes = {
  path: "셀프낙찰"|"배당대기"|"협의매입"|"캠코공매"|"재산추적"; score: number;
  eAssetization: number; eDividend: number; economicGain: number;
  gate: { offsetPossible: boolean; opposableClear: boolean; paymentAllowed: boolean };
  scenarios: { name: "낙관"|"기준"|"비관"; g: number; eAssetization: number }[];
  reasons: string[];
};
```

에러 상태: API 실패 시 ink 색 인라인 메시지 + 재시도 버튼. "오류가 발생했습니다" 단독 금지, 뭘 하면 되는지 명시.

## 7. 목데이터 시나리오 (MSW)

- tenant: 전세가율에 따라 등급이 갈리게 (70%→3%, 85%→7%, 95%→46%, 오피스텔 ×1.7). 주소에 "오류" 포함 시 에러 응답
- underwrite: EL > premium 계산을 목에서 실제 수행
- monitor: 고정 시드 8건 — 등급하락 3(T3/T1/T4), 경보만 2(T2), 무변동 3
- recovery: 다세대·수도권이면 셀프낙찰 우위, 오피스텔이면 배당대기 우위
- 목 딜레이 800~1500ms 랜덤

## 8. 구현 순서

1. 스캐폴딩 + 컬러토큰 + shared/ui 킷
2. 사이드바 + 라우팅 + 공통 헤더
3. MSW 셋업 + 핸들러 4개
4. tenant 페이지
5. underwrite 페이지
6. monitor 페이지
7. recovery 페이지
8. 마감: 로딩·에러·빈 상태 점검
