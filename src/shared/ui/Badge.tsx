import type { ReactNode } from "react";
import { gradeByIdx } from "@/shared/config/grades";

export type GradeName = "안심" | "주의" | "위험";

const GRADE_STYLE: Record<GradeName, string> = {
  안심: "bg-grade-safe-soft text-grade-safe",
  주의: "bg-grade-caution-soft text-grade-caution",
  위험: "bg-grade-danger-soft text-grade-danger",
};

/** 등급 배지 — 색 + 글자 등급 항상 병기 */
export function GradeBadge({
  grade,
  size = "md",
}: {
  grade: GradeName;
  size?: "md" | "lg";
}) {
  const sizeCls =
    size === "lg"
      ? "px-3.5 py-1 text-[22px] rounded-[4px]"
      : "px-2 py-0.5 text-[13px] rounded-[3px]";
  return (
    <span
      className={`inline-flex items-center font-bold ${sizeCls} ${GRADE_STYLE[grade] ?? "bg-canvas text-label"}`}
    >
      {grade}
    </span>
  );
}

/** 13등급(AAA~D) 배지 — 색은 3단계 신호등 매핑 재사용, 글자 등급 병기 원칙 유지 */
export function Grade13Badge({
  idx,
  size = "md",
  showBand = false,
}: {
  idx: number;
  size?: "md" | "lg";
  showBand?: boolean;
}) {
  const g = gradeByIdx(idx);
  const sizeCls =
    size === "lg" ? "px-3 py-1 text-[20px] rounded-md" : "px-2 py-0.5 text-[13px] rounded";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`num inline-flex items-center font-semibold ${sizeCls} ${GRADE_STYLE[g.legacy]}`}>
        {g.name}
      </span>
      {showBand && (
        <span
          className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
            g.band === "워치리스트" ? "bg-grade-danger-soft text-grade-danger" : "bg-canvas text-label"
          }`}
        >
          {g.band}
        </span>
      )}
    </span>
  );
}

export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-[3px] px-2 py-0.5 text-[12px] font-bold ${className}`}
    >
      {children}
    </span>
  );
}
