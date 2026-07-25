import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import type { TenantScoreRes } from "@/entities/assessment";
import { Card, GradeBadge } from "@/shared/ui";
import { formatKRWShort, formatPct } from "@/shared/lib/format";

const GRADE_HEX: Record<TenantScoreRes["grade"], string> = {
  안심: "#16A34A",
  주의: "#F59E0B",
  위험: "#DC2626",
};

/** 등급 히어로 — 등급 배지 + 40px 위험도 수치 + 보조 수치 + 반원 게이지 */
export function GradeHero({ result }: { result: TenantScoreRes }) {
  const color = GRADE_HEX[result.grade];
  return (
    <Card className="flex items-center justify-between p-8">
      <div>
        <GradeBadge grade={result.grade} size="lg" />
        <p className="mt-4 text-hero tabular-nums">
          사고확률 <span className="font-bold" style={{ color }}>{formatPct(result.riskPct)}</span>
        </p>
        <div className="mt-4 flex gap-8 text-[14px]">
          <div>
            <span className="text-muted">전세가율</span>{" "}
            <span className="font-bold text-ink tabular-nums">{formatPct(result.jeonseRatio)}</span>
          </div>
          <div>
            <span className="text-muted">추정 주택가액</span>{" "}
            <span className="font-bold text-ink tabular-nums">
              {result.housePrice !== null ? formatKRWShort(result.housePrice) : "미매칭 — 직접 입력 필요"}
            </span>
          </div>
        </div>
      </div>
      <div className="h-[150px] w-[260px]">
        <ResponsiveContainer>
          <RadialBarChart
            innerRadius="90%"
            outerRadius="140%"
            cy="90%"
            startAngle={180}
            endAngle={0}
            data={[{ value: result.riskPct }]}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" fill={color} background={{ fill: "#dee3e8" }} cornerRadius={6} />
          </RadialBarChart>
        </ResponsiveContainer>
        <p className="-mt-5 text-center text-[12px] text-muted">위험도 게이지 (0–100%)</p>
      </div>
    </Card>
  );
}
