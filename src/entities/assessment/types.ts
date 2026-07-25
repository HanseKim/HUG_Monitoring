// §6 API 스키마 — 백엔드 팀과 합의된 계약. 임의 변경 금지.

export const HOUSE_TYPES = [
  "아파트",
  "다세대주택",
  "연립주택",
  "오피스텔",
  "기타",
] as const;
export type HouseType = (typeof HOUSE_TYPES)[number];

export type TenantScoreReq = {
  address: string;
  houseType: HouseType;
  deposit: number;
  areaM2?: number;
  seniorLien?: "없음" | "근저당설정" | "압류·가압류" | "선순위존재" | "미상";
  insurance?: "가입" | "미가입" | "미상";
  hasLoan?: boolean;
};

export type ChecklistItem = {
  id: "HR0" | "HR1" | "HR2" | "HR3";
  fired: boolean;
  title: string;
  evidence: string;
};

export type TenantScoreRes = {
  grade: "안심" | "주의" | "위험";
  riskPct: number;
  jeonseRatio: number;
  housePrice: number | null;
  checklist: ChecklistItem[];
  similarCases: { region: string; summary: string; disputeType: string }[];
  insuranceReco: {
    type: "recommend" | "conditional" | "warning";
    product: string | null;
    message: string;
  };
  curve: { ratio: number; riskPct: number }[];
};

export type UnderwriteReq = {
  applicationId?: string;
  sido: string;
  sigungu: string;
  houseType: string;
  areaM2: number;
  deposit: number;
  housePrice: number;
  seniorAmount: number;
  appliedAt: string; // ISO date
};

export type UnderwriteRes = {
  verdict: "승인" | "거절";
  pdPct: number;
  lgdPct: number;
  ead: number;
  el: number;
  expectedPremium: number;
  reasons: string[];
  jeonseRatio: number;
  // 모델1 13등급 개편(2026-07)으로 추가 — 기존 필드는 하위 호환 유지
  grade13?: string; // "BB+" 등 13등급 문자열
  gradeIdx?: number; // 0(AAA)~12(D) — 정렬·비교는 반드시 이 값
  gradeBand?: "투자등급" | "투기등급";
  gradeReason?: string; // 사람이 읽는 등급 산정 사유
};
