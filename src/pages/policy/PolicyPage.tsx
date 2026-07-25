import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/widgets/page-header";
import { Card, Table, Th, Td, Badge } from "@/shared/ui";

// 데모용 목데이터 — 모델2 회수 결과 축적분에서 산출했다고 가정
const RECOVERY_TREND = [
  { month: "2026-01", predicted: 71.2, actual: 68.4 },
  { month: "2026-02", predicted: 72.0, actual: 69.8 },
  { month: "2026-03", predicted: 72.8, actual: 71.5 },
  { month: "2026-04", predicted: 73.1, actual: 72.9 },
  { month: "2026-05", predicted: 73.9, actual: 74.2 },
  { month: "2026-06", predicted: 74.6, actual: 75.1 },
  { month: "2026-07", predicted: 75.4, actual: null },
];

const RISK_SEGMENTS = [
  { segment: "수도권 오피스텔 · 전세가율 90%+", exposure: "1,240억", pd: "38.2%", trend: "▲ 급증" },
  { segment: "인천 미추홀구 다세대 · 선순위 존재", exposure: "820억", pd: "29.7%", trend: "▲ 증가" },
  { segment: "부천 원미구 연립 · 신축 2년 내", exposure: "410억", pd: "17.4%", trend: "▲ 증가" },
  { segment: "지방광역시 아파트 · 전세가율 80%↓", exposure: "2,980억", pd: "2.1%", trend: "— 안정" },
];

const POLICY_PROPOSALS = [
  {
    title: "수도권 오피스텔 인수 전세가율 상한 90% → 85%",
    basis: "해당 세그먼트 실제 회수율이 예측 대비 6.8%p 하회 — 상한 조정 시 예상손실 32% 감소 (목데이터)",
    impact: "EL -32%",
  },
  {
    title: "선순위 존재 물건 보증료율 가산 +0.3%p",
    basis: "선순위 존재 사고 건의 평균 회수기간이 11.2개월로 무선순위 대비 2.1배 (목데이터)",
    impact: "기간 리스크 보전",
  },
  {
    title: "미추홀구·부천 원미구 신규 인수 심사 강화 트리거 발동",
    basis: "T4 지역리스크 — 분기 보증사고율 2.1배 증가 감지",
    impact: "선제 차단",
  },
];

/** 내부 정책 반영 — 회수율 예측·사고 예상 → 인수기준 제안 */
export function PolicyPage() {
  return (
    <div>
      <PageHeader tabKey="policy" />

      <div className="grid grid-cols-[1.2fr_1fr] gap-5">
        {/* 회수율 예측 vs 실제 */}
        <Card className="p-6">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[15px] font-bold text-ink">회수율 — 예측 vs 실제</h3>
            <span className="caption">월별 · 목데이터</span>
          </div>
          <p className="mt-1 text-[12.5px] text-muted">
            회수 결과가 축적될수록 예측선(모델)과 실제선의 간격이 줄어듭니다 — 환류 효과.
          </p>
          <div className="mt-4 h-[220px]">
            <ResponsiveContainer>
              <LineChart data={RECOVERY_TREND} margin={{ top: 8, right: 12, left: -8 }}>
                <CartesianGrid stroke="#E3E7EC" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={(v: string) => v.slice(5) + "월"}
                  tick={{ fontSize: 11, fill: "#7C8798" }}
                  axisLine={{ stroke: "#E3E7EC" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[65, 80]}
                  tickFormatter={(v: number) => `${v}%`}
                  tick={{ fontSize: 11, fill: "#7C8798" }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip
                  formatter={(v: unknown, name: unknown) => [
                    v === null ? "집계 전" : `${v}%`,
                    name === "predicted" ? "예측 회수율" : "실제 회수율",
                  ]}
                  contentStyle={{
                    border: "1px solid #E3E7EC",
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: "none",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#7C8798"
                  strokeDasharray="4 3"
                  strokeWidth={2}
                  dot={false}
                />
                <Line type="monotone" dataKey="actual" stroke="#16325C" strokeWidth={2.5} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-5 text-[11.5px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-5 bg-[#16325C]" /> 실제 회수율
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-[#7C8798]" />{" "}
              모델 예측
            </span>
          </div>
        </Card>

        {/* 사고 예상 세그먼트 */}
        <Card className="p-6">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[15px] font-bold text-ink">사고 예상 세그먼트</h3>
            <span className="caption">익스포저 기준 · 목데이터</span>
          </div>
          <div className="mt-4">
            <Table>
              <thead>
                <tr>
                  <Th>세그먼트</Th>
                  <Th className="text-right">익스포저</Th>
                  <Th className="text-right">예상 PD</Th>
                  <Th>추세</Th>
                </tr>
              </thead>
              <tbody>
                {RISK_SEGMENTS.map((s) => (
                  <tr key={s.segment}>
                    <Td className="text-[12.5px]">{s.segment}</Td>
                    <Td className="num text-right text-[12.5px]">{s.exposure}</Td>
                    <Td className="num text-right text-[12.5px]">{s.pd}</Td>
                    <Td
                      className={
                        s.trend.startsWith("▲")
                          ? "text-[12px] text-grade-danger"
                          : "text-[12px] text-muted"
                      }
                    >
                      {s.trend}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>

      {/* 인수기준·정책 제안 */}
      <Card className="mt-5 p-6">
        <h3 className="text-[15px] font-bold text-ink">인수기준·정책 반영 제안</h3>
        <p className="mt-1 text-[12.5px] text-muted">
          회수 결과 축적분이 근거입니다. 채택 시 다음 분기 인수기준에 반영됩니다.
        </p>
        <ul className="mt-4 divide-y divide-divider">
          {POLICY_PROPOSALS.map((p) => (
            <li key={p.title} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
              <Badge className="mt-0.5 shrink-0 bg-stage-policy-soft text-stage-policy">
                {p.impact}
              </Badge>
              <div>
                <p className="text-[14px] font-bold text-ink">{p.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-body">{p.basis}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
