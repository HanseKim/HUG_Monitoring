// §6 API 스키마 — 모니터링 계약

export type Snapshot = {
  grade: string;
  riskPct: number;
  jeonseRatio: number;
  snapshotAt: string;
  // 13등급 개편 추가 필드 (하위 호환 — 없으면 riskPct로 환산)
  grade13?: string;
  gradeIdx?: number;
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

/** GET /api/monitor/portfolio — 모델 산출물 기반 리스크 현황 */
export type ModelDashboard = {
  asOf: string;
  /** 학습 데이터셋 요약 */
  dataset: {
    total: number;
    incidents: number;
    incidentRate: number; // 전체 사고율(%)
    testFrom: string;
    testTo: string;
    testCount: number;
  };
  /** 시험셋 성능 지표 */
  performance: {
    auc: number;
    ap: number;
    brier: number;
    gradeMonotonicity: number; // Spearman
  };
  /** 워치리스트(BB+ 이하) 집중도 — 대시보드의 핵심 서사 */
  watch: {
    thresholdGrade: string;
    contractShare: number; // 계약 비중(%)
    captureRate: number; // 사고 포착률(%)
    watchRate: number; // 워치 사고율(%)
    nonWatchRate: number; // 비워치 사고율(%)
    lift: number; // 배수
  };
  /** 등급별 분포 + 실측 사고율 */
  grades: {
    idx: number;
    name: string;
    count: number;
    actualRate: number; // 실제 사고율(%)
    predictedPd: number; // 예측 PD(%)
  }[];
};
