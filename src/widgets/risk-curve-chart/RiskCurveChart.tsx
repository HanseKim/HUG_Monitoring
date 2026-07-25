import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TenantScoreRes } from "@/entities/assessment";
import { Card } from "@/shared/ui";
import { formatPct } from "@/shared/lib/format";

/** 전세가율별 위험도 곡선 + 내 위치 + 대안 시나리오 1줄 */
export function RiskCurveChart({ result }: { result: TenantScoreRes }) {
  const { curve, jeonseRatio, riskPct } = result;
  // 대안 시나리오: 85% 지점의 곡선 위험도
  const alt = curve.reduce((best, p) =>
    Math.abs(p.ratio - 85) < Math.abs(best.ratio - 85) ? p : best,
  );
  const showAlt = jeonseRatio > 85;

  return (
    <Card className="p-6">
      <h3 className="mb-1 text-[16px] font-bold text-ink">전세가율별 위험도 비교</h3>
      <p className="mb-4 text-[12px] text-muted">같은 주택유형 기준 위험도 곡선 위의 내 위치</p>
      <div className="h-[240px]">
        <ResponsiveContainer>
          <LineChart data={curve} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#dee3e8" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="ratio"
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 12, fill: "#858d94" }}
              axisLine={{ stroke: "#dee3e8" }}
              tickLine={false}
              type="number"
              domain={["dataMin", "dataMax"]}
            />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 12, fill: "#858d94" }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip
              formatter={(v) => [`${Number(v).toFixed(1)}%`, "위험도"]}
              labelFormatter={(l) => `전세가율 ${l}%`}
              contentStyle={{
                border: "1px solid #dee3e8",
                borderRadius: 8,
                fontSize: 12,
                boxShadow: "none",
              }}
            />
            <Line
              type="monotone"
              dataKey="riskPct"
              stroke="#16A34A"
              strokeWidth={2}
              dot={false}
            />
            <ReferenceDot
              x={Math.min(Math.max(jeonseRatio, curve[0].ratio), curve[curve.length - 1].ratio)}
              y={riskPct}
              r={6}
              fill="#DC2626"
              stroke="#ffffff"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {showAlt && (
        <p className="mt-3 rounded-lg bg-tenant-soft px-4 py-2.5 text-[13px] text-label">
          전세가율을 <b className="text-tenant">85%</b>로 낮추면 위험도는{" "}
          <b className="text-tenant">{formatPct(alt.riskPct)}</b>까지 내려갑니다. 보증금 감액
          협상을 고려해보세요.
        </p>
      )}
    </Card>
  );
}
