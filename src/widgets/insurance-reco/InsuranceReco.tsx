import type { TenantScoreRes } from "@/entities/assessment";
import { Card } from "@/shared/ui";

const TONE: Record<
  TenantScoreRes["insuranceReco"]["type"],
  { label: string; cls: string }
> = {
  recommend: { label: "가입 추천", cls: "bg-grade-safe-soft text-grade-safe" },
  conditional: { label: "조건부", cls: "bg-grade-caution-soft text-grade-caution" },
  warning: { label: "경고", cls: "bg-grade-danger-soft text-grade-danger" },
};

export function InsuranceReco({ reco }: { reco: TenantScoreRes["insuranceReco"] }) {
  const tone = TONE[reco.type];
  return (
    <Card className="flex h-full flex-col p-6">
      <h3 className="mb-4 text-[16px] font-bold text-ink">보증보험 추천</h3>
      <div className="flex items-center gap-2">
        <span className={`rounded-md px-2.5 py-0.5 text-[13px] font-bold ${tone.cls}`}>
          {tone.label}
        </span>
        {reco.product && (
          <span className="text-[14px] font-bold text-ink">{reco.product}</span>
        )}
      </div>
      <p className="mt-3 flex-1 text-[13px] leading-relaxed text-body">{reco.message}</p>
      <p className="mt-4 border-t border-divider pt-3 text-[12px] text-muted">
        실제 승인 여부는 HUG 심사에서 최종 결정됩니다.
      </p>
    </Card>
  );
}
