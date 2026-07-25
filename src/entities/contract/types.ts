// §6 API 스키마 — 모니터링 계약

export type Snapshot = {
  grade: string;
  riskPct: number;
  jeonseRatio: number;
  snapshotAt: string;
  // 13등급 개편 추가 필드 (하위 호환 — 없으면 riskPct로 환산)
  grade13?: string;
  gradeIdx?: number;
  // 재산정 경제성 지표 (모니터링 확장) — 없으면 프론트 미표시
  el?: number; // 예상손실액(원) = PD × LGD × 보증금
  recoveryRate?: number; // 예상 회수율(%)
};

export type TriggerType = "T1_정기" | "T2_금리" | "T3_등기변동" | "T4_지역리스크";

export type MonitorContract = {
  contractId: string;
  address: string;
  houseType: string;
  before: Snapshot;
  after: Snapshot | null; // null=무변동
  trigger: TriggerType | null;
  reason: string | null;
  recommendations: string[];
  // 모니터링 확장 필드
  deposit?: number; // 보증금(원) — 익스포저
  strategyBefore?: string; // 재산정 전 회수 전략
  strategyAfter?: string | null; // 재산정 후 회수 전략 (변경 없으면 동일 값)
};

/** GET /api/monitor/portfolio — 포트폴리오 전체 리스크 요약 */
export type PortfolioSummary = {
  asOf: string;
  contractCount: number;
  totalExposure: number; // 총 보증금 익스포저(원)
  el: {
    ytd: number; // 올해 누적 예상손실(원)
    month: number; // 이번달 예상손실(원)
    momDelta: number; // 전월 대비 증감(원)
    realizedYtd: number; // 올해 실현손실(대위변제 지급액)
  };
  recovery: {
    actualYtd: number; // 올해 실현 회수율(%)
    predicted: number; // 모델 예측 회수율(%)
    momDelta: number; // 전월 대비 증감(%p)
    avgMonths: number; // 평균 회수 소요기간(개월)
  };
  paths: { path: string; count: number; recoveredAmount: number }[];
  grades: { idx: number; name: string; count: number; exposure: number }[];
  migration: { downgraded: number; upgraded: number; toSpeculative: number };
};
