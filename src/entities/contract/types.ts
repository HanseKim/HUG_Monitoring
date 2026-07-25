// §6 API 스키마 — 모니터링 계약

export type Snapshot = {
  grade: string;
  riskPct: number;
  jeonseRatio: number;
  snapshotAt: string;
};

export type TriggerType = "T1_정기" | "T2_금리" | "T3_등기변동" | "T4_지역리스크";

export type MonitorContract = {
  contractId: string;
  address: string;
  houseType: string;
  before: Snapshot;
  after: Snapshot | null; // null = 무변동
  trigger: TriggerType | null;
  reason: string | null;
  recommendations: string[];
};
