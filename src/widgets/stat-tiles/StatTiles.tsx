import type { UnderwriteRes } from "@/entities/assessment";
import { Card } from "@/shared/ui";
import { formatKRWShort, formatPct } from "@/shared/lib/format";

/** PD/LGD/EAD/EL 4스탯 타일 — EL은 예상보험료 비교 막대 포함 */
export function StatTiles({ result }: { result: UnderwriteRes }) {
  const { pdPct, lgdPct, ead, el, expectedPremium } = result;
  const max = Math.max(el, expectedPremium, 1);

  return (
    <div className="grid grid-cols-4 gap-5">
      <Tile label="부도확률 PD" value={formatPct(pdPct)} />
      <Tile label="손실률 LGD" value={formatPct(lgdPct)} />
      <Tile label="익스포저 EAD" value={formatKRWShort(ead)} />
      <Card className="p-5">
        <p className="text-[12px] font-bold text-muted">예상손실 EL vs 예상보험료</p>
        <p className="num mt-2 text-[24px] text-ink">
          {formatKRWShort(el)}
        </p>
        <div className="mt-3 space-y-1.5">
          <BarRow label="EL" amount={el} max={max} barCls={el > expectedPremium ? "bg-grade-danger" : "bg-grade-safe"} />
          <BarRow label="보험료" amount={expectedPremium} max={max} barCls="bg-hairline" />
        </div>
      </Card>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="text-[12px] font-bold text-muted">{label}</p>
      <p className="num mt-2 text-[32px] leading-tight text-ink">
        {value}
      </p>
    </Card>
  );
}

function BarRow({
  label,
  amount,
  max,
  barCls,
}: {
  label: string;
  amount: number;
  max: number;
  barCls: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-[11px] text-muted">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas">
        <div className={`h-full rounded-full ${barCls}`} style={{ width: `${(amount / max) * 100}%` }} />
      </div>
      <span className="w-20 shrink-0 text-right text-[11px] text-body tabular-nums">
        {formatKRWShort(amount)}
      </span>
    </div>
  );
}
