// 모델1 위험등급 체계 — 19등급 (AAA ~ C)
// 출처: 모델 저장소 grade_scale.py + 2024 시험셋(25,519건) 등급별 실측 성능표.
// 정렬·비교·델타는 반드시 idx(숫자)로 할 것. 문자열 파싱 금지.

export type GradeBand = "투자등급" | "워치리스트";
export type LegacyTier = "안심" | "주의" | "위험";

export type GradeSpec = {
  idx: number; // 0(AAA) ~ 18(C)
  name: string;
  /** PD 상한(%) — 모델 저장소 GRADE_BANDS 정본값 (등급판정모델/code/run.py) */
  maxPd: number | null;
  band: GradeBand;
  legacy: LegacyTier; // 색 매핑용 (실측 사고율 기준 3구간)
  /** 2024 시험셋(25,519건) 실측 — 출처: 등급판정모델/outputs/등급별_검증표.csv */
  testCount: number;
  actualRate: number; // 실제 사고율(%)
  predictedPd: number; // 모델 예측 PD(%)
};

/** 워치리스트 시작 등급 idx — BB+ 이하가 워치 대상 */
export const WATCH_START = 10;

export const GRADE_SCALE: GradeSpec[] = [
  // AAA는 경계표에는 있으나 2024 시험셋에 유효 표본이 없어 화면에는 표시하지 않는다(testCount 0).
  { idx: 0, name: "AAA", maxPd: 0.1, band: "투자등급", legacy: "안심", testCount: 0, actualRate: 0, predictedPd: 0.09 },
  { idx: 1, name: "AA+", maxPd: 0.2, band: "투자등급", legacy: "안심", testCount: 128, actualRate: 0.0, predictedPd: 0.17 },
  { idx: 2, name: "AA0", maxPd: 0.35, band: "투자등급", legacy: "안심", testCount: 727, actualRate: 0.69, predictedPd: 0.28 },
  { idx: 3, name: "AA-", maxPd: 0.5, band: "투자등급", legacy: "안심", testCount: 1224, actualRate: 0.74, predictedPd: 0.43 },
  { idx: 4, name: "A+", maxPd: 0.8, band: "투자등급", legacy: "안심", testCount: 2973, actualRate: 0.57, predictedPd: 0.64 },
  { idx: 5, name: "A0", maxPd: 1.1, band: "투자등급", legacy: "안심", testCount: 2158, actualRate: 0.83, predictedPd: 0.94 },
  { idx: 6, name: "A-", maxPd: 1.5, band: "투자등급", legacy: "안심", testCount: 2281, actualRate: 1.67, predictedPd: 1.29 },
  { idx: 7, name: "BBB+", maxPd: 2.2, band: "투자등급", legacy: "주의", testCount: 2972, actualRate: 2.46, predictedPd: 1.83 },
  { idx: 8, name: "BBB0", maxPd: 3.0, band: "투자등급", legacy: "주의", testCount: 2230, actualRate: 3.0, predictedPd: 2.56 },
  { idx: 9, name: "BBB-", maxPd: 4.0, band: "투자등급", legacy: "주의", testCount: 2004, actualRate: 4.39, predictedPd: 3.47 },
  { idx: 10, name: "BB+", maxPd: 6.0, band: "워치리스트", legacy: "주의", testCount: 2356, actualRate: 5.9, predictedPd: 4.91 },
  { idx: 11, name: "BB0", maxPd: 8.0, band: "워치리스트", legacy: "주의", testCount: 1451, actualRate: 8.06, predictedPd: 6.95 },
  { idx: 12, name: "BB-", maxPd: 10.0, band: "워치리스트", legacy: "주의", testCount: 1087, actualRate: 10.86, predictedPd: 8.96 },
  { idx: 13, name: "B+", maxPd: 15.0, band: "워치리스트", legacy: "위험", testCount: 1268, actualRate: 14.67, predictedPd: 12.05 },
  { idx: 14, name: "B0", maxPd: 20.0, band: "워치리스트", legacy: "위험", testCount: 631, actualRate: 22.66, predictedPd: 17.17 },
  { idx: 15, name: "B-", maxPd: 25.0, band: "워치리스트", legacy: "위험", testCount: 429, actualRate: 28.21, predictedPd: 22.26 },
  { idx: 16, name: "CCC", maxPd: 50.0, band: "워치리스트", legacy: "위험", testCount: 827, actualRate: 33.37, predictedPd: 35.02 },
  { idx: 17, name: "CC", maxPd: 75.0, band: "워치리스트", legacy: "위험", testCount: 460, actualRate: 58.48, predictedPd: 61.16 },
  { idx: 18, name: "C", maxPd: null, band: "워치리스트", legacy: "위험", testCount: 312, actualRate: 81.73, predictedPd: 88.23 },
];

export const LAST_IDX = GRADE_SCALE.length - 1;

export const gradeByIdx = (idx: number): GradeSpec =>
  GRADE_SCALE[Math.min(LAST_IDX, Math.max(0, Math.round(idx)))];

// 모델 to_grade()와 동일하게 lo <= pd < hi 구간 판정
export const gradeFromPd = (pd: number): GradeSpec =>
  GRADE_SCALE.find((g) => g.maxPd !== null && pd < g.maxPd) ?? GRADE_SCALE[LAST_IDX];

export const isWatch = (idx: number): boolean => idx >= WATCH_START;

/** 강등 델타 — 모델 쪽 grade_delta 유틸과 동일 형태 */
export const gradeDelta = (prevIdx: number, currIdx: number) => ({
  delta: currIdx - prevIdx,
  direction:
    currIdx > prevIdx ? ("강등" as const) : currIdx < prevIdx ? ("승급" as const) : ("유지" as const),
  /** 투자등급 → 워치리스트 경계 통과 */
  crossedToSpeculative: prevIdx < WATCH_START && currIdx >= WATCH_START,
});

/** 등급별 관리강도 — 모델 predict.py의 관리강도 분기와 동일 */
export const supervision = (idx: number): string =>
  idx < 7
    ? "연1회 재평가"
    : idx < WATCH_START
      ? "분기 재평가"
      : idx < 13
        ? "월 재평가 + 만기캘린더"
        : "월 재평가 + 최우선 관리";
