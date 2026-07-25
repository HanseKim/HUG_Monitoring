// §6 API 스키마 — 사후처리(모델2)

export type RecoveryReq = {
  caseNo?: string;
  address: string;
  houseType: string;
  areaM2: number;
  subrogationAmount: number;
  seniorAmount: number;
  appraisalPrice: number;
  minBidPrice: number;
  failedBidCount: number;
  evictionStatus?: "양호" | "점유중" | "미상";
  defectStatus?: "양호" | "경미" | "보수필요" | "미상";
  opposableTenant?: "유" | "무" | "미상";
};

export type RecoveryPath =
  | "셀프낙찰"
  | "배당대기"
  | "협의매입"
  | "캠코공매"
  | "재산추적";

export type RecoveryRes = {
  path: RecoveryPath;
  score: number;
  eAssetization: number;
  eDividend: number;
  economicGain: number;
  gate: {
    offsetPossible: boolean;
    opposableClear: boolean;
    paymentAllowed: boolean;
  };
  scenarios: { name: "낙관" | "기준" | "비관"; g: number; eAssetization: number }[];
  reasons: string[];
};
