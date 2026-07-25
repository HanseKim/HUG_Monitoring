import { GRADE13 } from "@/shared/config/grades";

const ZONE_BASE: Record<string, string> = {
  안심: "bg-grade-safe/15",
  주의: "bg-grade-caution/20",
  위험: "bg-grade-danger/15",
};
const ZONE_SOLID: Record<string, string> = {
  안심: "bg-grade-safe",
  주의: "bg-grade-caution",
  위험: "bg-grade-danger",
};

/**
 * 13등급 트랙 — AAA→D 눈금 위에 전(윤곽)→후(채움) 이동을 표시.
 * 강등 구간은 중간 톤으로 칠해 이동 폭이 한눈에 보이게 한다.
 */
export function GradeTrack({ from, to }: { from: number; to: number }) {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  return (
    <div className="flex items-center gap-[3px]" aria-label={`등급 이동 ${from}→${to}`}>
      {GRADE13.map((g) => {
        const isFrom = g.idx === from;
        const isTo = g.idx === to;
        const inSpan = g.idx > lo && g.idx < hi;
        let cls = ZONE_BASE[g.legacy];
        if (isTo) cls = ZONE_SOLID[g.legacy];
        else if (inSpan || (isFrom && from !== to)) cls = `${ZONE_SOLID[g.legacy]} opacity-40`;
        return (
          <span
            key={g.idx}
            title={g.name}
            className={`h-[7px] flex-1 rounded-[2px] ${cls} ${
              isFrom && from !== to ? "ring-1 ring-inset ring-ink/40" : ""
            }`}
          />
        );
      })}
    </div>
  );
}
