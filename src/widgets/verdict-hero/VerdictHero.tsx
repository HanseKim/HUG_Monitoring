import type { UnderwriteRes } from "@/entities/assessment";
import { GradeBadge, type GradeName } from "@/shared/ui";
import { formatPct } from "@/shared/lib/format";

/** 모델1 위험도 → 최초 등급 */
export const gradeFromPd = (pdPct: number): GradeName =>
  pdPct < 5 ? "안심" : pdPct < 20 ? "주의" : "위험";

/** 판정 히어로 — 다크 관제 패널. 126%룰 게이트 + 최초 등급 */
export function VerdictHero({ result }: { result: UnderwriteRes }) {
  const approved = result.verdict === "승인";
  const grade = gradeFromPd(result.pdPct);
  const gatePass = result.jeonseRatio <= 90;

  return (
    <section className="rounded-xl bg-rail p-8 text-white">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div>
          <p className="caption !text-rail-text">인수 판정</p>
          <p
            className={`mt-1 text-[34px] font-bold leading-tight ${
              approved ? "text-grade-safe" : "text-grade-danger"
            }`}
          >
            {result.verdict}
          </p>
        </div>
        <div className="h-12 w-px bg-rail-line" aria-hidden />
        <div>
          <p className="caption !text-rail-text">최초 등급 (모델1)</p>
          <div className="mt-1.5">
            <GradeBadge grade={grade} />
          </div>
        </div>
        <div>
          <p className="caption !text-rail-text">HUG 기준 게이트</p>
          <p className="mt-1 text-[14px]">
            전세가율 <span className="num text-[16px]">{formatPct(result.jeonseRatio)}</span>{" "}
            <span className={gatePass ? "text-grade-safe" : "text-grade-danger"}>
              {gatePass ? "· 기준(90%) 이내" : "· 기준(90%) 초과"}
            </span>
          </p>
        </div>
      </div>
      <ul className="mt-6 space-y-1.5 border-t border-rail-line pt-4">
        {result.reasons.map((r, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-rail-text">
            <span aria-hidden>·</span>
            {r}
          </li>
        ))}
      </ul>
    </section>
  );
}
