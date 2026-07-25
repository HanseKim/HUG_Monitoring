import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import type { RecoveryReq, RecoveryRes } from "@/entities/recovery-case";
import { Button, Card, Table, Th, Td } from "@/shared/ui";
import { formatKRWShort } from "@/shared/lib/format";

const NAVY = "#0B3B7A";

type Props = {
  req: RecoveryReq;
  res: RecoveryRes;
  judgedAt: string; // YYYY-MM-DD
};

/** 사후처리 판정 레포트 — 문서 톤, print 대응 */
export function RecoveryReport({ req, res, judgedAt }: Props) {
  const barData = [
    { name: "E[자산화]", value: res.eAssetization },
    { name: "E[배당]", value: res.eDividend },
  ];

  return (
    <Card className="print-report p-10">
      {/* 헤더 */}
      <div className="flex items-start justify-between border-b-2 border-ink pb-5">
        <div>
          <h3 className="text-[22px] font-bold tracking-tight text-ink">
            사후처리 판정 레포트
          </h3>
          <p className="mt-1.5 text-[13px] text-body">
            사건번호 {req.caseNo ?? "미지정"} · 판정일 {judgedAt}
          </p>
          <p className="mt-0.5 text-[13px] text-body">
            대상: {req.address} ({req.houseType}, {req.areaM2}㎡)
          </p>
        </div>
        <Button
          variant="secondary"
          className="print-hidden h-10 px-4 text-[13px]"
          onClick={() => window.print()}
        >
          PDF로 저장
        </Button>
      </div>

      {/* 판정 히어로 */}
      <div className="flex items-center gap-6 border-b border-divider py-7">
        <span className="rounded-lg bg-recovery-soft px-6 py-2.5 text-[32px] font-bold text-recovery">
          {res.path}
        </span>
        <div>
          <p className="text-[13px] text-muted">판정 점수</p>
          <p className="text-[36px] font-normal leading-tight tracking-tight text-slate tabular-nums">
            {res.score}
            <span className="text-[16px] text-muted"> / 100</span>
          </p>
        </div>
      </div>

      {/* 기대값 비교 */}
      <section className="border-b border-divider py-7">
        <h4 className="mb-3 text-[15px] font-bold text-ink">1. 기대 회수액 비교</h4>
        <div className="h-[120px]">
          <ResponsiveContainer>
            <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 90 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fontSize: 13, fill: "#4b525a" }}
                axisLine={false}
                tickLine={false}
              />
              <Bar dataKey="value" fill={NAVY} barSize={22} radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(v: unknown) => formatKRWShort(Number(v))}
                  style={{ fontSize: 12, fill: "#3c3c3c" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-[13px] text-body">
          경제이득(자산화 − 배당):{" "}
          <b className={res.economicGain >= 0 ? "text-recovery" : "text-grade-danger"}>
            {res.economicGain >= 0 ? "+" : "−"}
            {formatKRWShort(Math.abs(res.economicGain))}
          </b>
        </p>
      </section>

      {/* 게이트 */}
      <section className="border-b border-divider py-7">
        <h4 className="mb-3 text-[15px] font-bold text-ink">2. 셀프낙찰 게이트 통과 여부</h4>
        <Table>
          <thead>
            <tr>
              <Th>게이트</Th>
              <Th>판정</Th>
            </tr>
          </thead>
          <tbody>
            <GateRow label="대위변제채권 상계 가능" pass={res.gate.offsetPossible} />
            <GateRow label="대항력 임차인 부담 없음" pass={res.gate.opposableClear} />
            <GateRow label="차액지급 요건 충족" pass={res.gate.paymentAllowed} />
          </tbody>
        </Table>
      </section>

      {/* 시나리오 */}
      <section className="border-b border-divider py-7">
        <h4 className="mb-3 text-[15px] font-bold text-ink">3. 시나리오 분석</h4>
        <Table>
          <thead>
            <tr>
              <Th>시나리오</Th>
              <Th className="text-right">시장변동률 g</Th>
              <Th className="text-right">E[자산화]</Th>
            </tr>
          </thead>
          <tbody>
            {res.scenarios.map((s) => (
              <tr key={s.name}>
                <Td className={s.name === "기준" ? "font-bold" : ""}>{s.name}</Td>
                <Td className="text-right tabular-nums">
                  {s.g > 0 ? "+" : ""}
                  {(s.g * 100).toFixed(0)}%
                </Td>
                <Td className="text-right tabular-nums">{formatKRWShort(s.eAssetization)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      {/* 근거 */}
      <section className="pt-7">
        <h4 className="mb-3 text-[15px] font-bold text-ink">4. 판정 근거</h4>
        <ol className="space-y-2.5">
          {res.reasons.map((r, i) => (
            <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-body">
              <span className="shrink-0 font-bold text-recovery">{i + 1}.</span>
              {r}
            </li>
          ))}
        </ol>
      </section>
    </Card>
  );
}

function GateRow({ label, pass }: { label: string; pass: boolean }) {
  return (
    <tr>
      <Td>{label}</Td>
      <Td>
        {pass ? (
          <span className="font-bold text-grade-safe">✓ 통과</span>
        ) : (
          <span className="font-bold text-grade-danger">✗ 미충족</span>
        )}
      </Td>
    </tr>
  );
}
