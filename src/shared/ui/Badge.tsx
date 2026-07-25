import type { ReactNode } from "react";

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
      ? "px-4 py-1.5 text-[24px] rounded-lg"
      : "px-2.5 py-0.5 text-[13px] rounded-md";
  return (
    <span
      className={`inline-flex items-center font-bold ${sizeCls} ${GRADE_STYLE[grade] ?? "bg-canvas text-label"}`}
    >
      {grade}
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
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-bold ${className}`}
    >
      {children}
    </span>
  );
}
