import type { TenantScoreRes } from "@/entities/assessment";
import { Badge, Card } from "@/shared/ui";

export function SimilarCases({ cases }: { cases: TenantScoreRes["similarCases"] }) {
  return (
    <Card className="p-6">
      <h3 className="text-[16px] font-bold text-ink">유사 피해 사례</h3>
      <p className="mb-4 mt-0.5 text-[12px] text-muted">지역×유형×보증금구간 기준</p>
      <ul className="space-y-4">
        {cases.map((c, i) => (
          <li key={i} className="border-l-[3px] border-hairline pl-4">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[13px] font-bold text-label">{c.region}</span>
              <Badge className="bg-canvas text-muted">{c.disputeType}</Badge>
            </div>
            <p className="text-[13px] leading-relaxed text-body">{c.summary}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
