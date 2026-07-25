import type { UnderwriteRes } from "@/entities/assessment";
import { Card } from "@/shared/ui";
import { formatPct } from "@/shared/lib/format";

/** 승인/거절 판정 히어로 */
export function VerdictHero({ result }: { result: UnderwriteRes }) {
  const approved = result.verdict === "승인";
  return (
    <Card className="p-8">
      <div className="flex items-center gap-6">
        <span
          className={`rounded-lg px-5 py-2 text-[32px] font-bold ${
            approved
              ? "bg-grade-safe-soft text-grade-safe"
              : "bg-grade-danger-soft text-grade-danger"
          }`}
        >
          {result.verdict}
        </span>
        <div>
          <p className="text-[14px] text-muted">
            전세가율 <b className="text-ink tabular-nums">{formatPct(result.jeonseRatio)}</b>
          </p>
          <p className="mt-0.5 text-[13px] text-body">
            {approved
              ? "예상손실이 예상보험료 범위 내로, 보증 인수가 타당한 건입니다."
              : "예상손실 또는 전세가율이 인수 기준을 벗어나 보증 인수가 어려운 건입니다."}
          </p>
        </div>
      </div>
      <ul className="mt-5 space-y-1.5 border-t border-divider pt-4">
        {result.reasons.map((r, i) => (
          <li key={i} className="flex gap-2 text-[13px] text-body">
            <span className="text-faint">•</span>
            {r}
          </li>
        ))}
      </ul>
    </Card>
  );
}
