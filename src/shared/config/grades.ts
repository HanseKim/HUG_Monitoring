// 모델1 13등급 체계 (AAA~D) — 소스 오브 트루스: 모델 저장소 grade_scale.py
// 경계값(특히 BBB=5%, BB=10%)은 검증 결과와 물려 있어 임의 조정 금지.

export type GradeBand = "투자등급" | "투기등급";
export type LegacyTier = "안심" | "주의" | "위험";

export type Grade13 = {
  idx: number; // 0(AAA) ~ 12(D) — 정렬·비교·델타는 반드시 idx로
  name: string;
  maxPd: number | null; // PD 상한(%), D는 상한 없음
  band: GradeBand;
  legacy: LegacyTier;
};

export const GRADE13: Grade13[] = [
  { idx: 0, name: "AAA", maxPd: 0.3, band: "투자등급", legacy: "안심" },
  { idx: 1, name: "AA+", maxPd: 0.5, band: "투자등급", legacy: "안심" },
  { idx: 2, name: "AA", maxPd: 0.9, band: "투자등급", legacy: "안심" },
  { idx: 3, name: "A+", maxPd: 1.6, band: "투자등급", legacy: "안심" },
  { idx: 4, name: "A", maxPd: 2.8, band: "투자등급", legacy: "안심" },
  { idx: 5, name: "BBB", maxPd: 5.0, band: "투자등급", legacy: "안심" },
  { idx: 6, name: "BB+", maxPd: 7.2, band: "투기등급", legacy: "주의" },
  { idx: 7, name: "BB", maxPd: 10.0, band: "투기등급", legacy: "주의" },
  { idx: 8, name: "B", maxPd: 16.0, band: "투기등급", legacy: "위험" },
  { idx: 9, name: "CCC", maxPd: 26.0, band: "투기등급", legacy: "위험" },
  { idx: 10, name: "CC", maxPd: 45.0, band: "투기등급", legacy: "위험" },
  { idx: 11, name: "C", maxPd: 70.0, band: "투기등급", legacy: "위험" },
  { idx: 12, name: "D", maxPd: null, band: "투기등급", legacy: "위험" },
];

export const gradeByIdx = (idx: number): Grade13 =>
  GRADE13[Math.min(12, Math.max(0, Math.round(idx)))];

export const gradeFromPd = (pd: number): Grade13 =>
  GRADE13.find((g) => g.maxPd !== null && pd <= g.maxPd) ?? GRADE13[12];

/** 강등 델타 — 모델 쪽 grade_delta 유틸과 동일 형태 */
export const gradeDelta = (prevIdx: number, currIdx: number) => ({
  delta: currIdx - prevIdx,
  direction: currIdx > prevIdx ? ("강등" as const) : currIdx < prevIdx ? ("승급" as const) : ("유지" as const),
  crossedToSpeculative: prevIdx <= 5 && currIdx >= 6,
});
