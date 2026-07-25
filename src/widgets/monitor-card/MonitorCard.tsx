import { useState } from "react";
import type { MonitorContract, Snapshot, TriggerType } from "@/entities/contract";
import { Badge, Card, GradeBadge, type GradeName } from "@/shared/ui";
import { formatPct } from "@/shared/lib/format";

const TRIGGER_LABEL: Record<TriggerType, string> = {
  T1_정기: "T1 정기",
  T2_금리: "T2 금리",
  T3_등기변동: "T3 등기변동",
  T4_지역리스크: "T4 지역리스크",
};

const GRADE_ORDER: Record<string, number> = { 안심: 0, 주의: 1, 위험: 2 };

export const isDowngrade = (c: MonitorContract) =>
  c.after !== null && GRADE_ORDER[c.after.grade] > GRADE_ORDER[c.before.grade];

function SnapshotBox({
  snap,
  tone,
}: {
  snap: Snapshot;
  tone: "before" | "after";
}) {
  const mutedTone = tone === "before";
  return (
    <div
      className={`w-[220px] rounded-lg border p-4 ${
        mutedTone ? "border-divider bg-canvas" : "border-divider bg-surface"
      }`}
    >
      <p className="mb-2 text-[11px] font-bold text-muted">
        {mutedTone ? "변동 전" : "변동 후"}
      </p>
      <div className="flex items-center gap-2">
        <GradeBadge grade={snap.grade as GradeName} />
        <span
          className={`text-[20px] tabular-nums ${
            mutedTone ? "font-normal text-muted" : "font-bold text-ink"
          }`}
        >
          {formatPct(snap.riskPct)}
        </span>
      </div>
      <p className={`mt-2 text-[12px] ${mutedTone ? "text-faint" : "text-body"}`}>
        전세가율 {formatPct(snap.jeonseRatio, 0)}
      </p>
      <p className="mt-0.5 text-[11px] text-faint">{snap.snapshotAt}</p>
    </div>
  );
}

export function MonitorCard({ contract }: { contract: MonitorContract }) {
  const downgrade = isDowngrade(contract);
  // 임차인 고지 — 등급 하락 시 세입자에게 즉시 안내 (데모: 로컬 상태)
  const [noticeSent, setNoticeSent] = useState(false);
  return (
    <Card className={`p-6 ${downgrade ? "border-t-[3px] border-t-grade-danger" : ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[14px] font-bold text-ink">
          {contract.address}
          <span className="ml-2 font-normal text-muted">
            · {contract.houseType} · {contract.contractId}
          </span>
        </p>
        {contract.trigger && (
          <Badge className="bg-monitor-soft text-monitor">
            {TRIGGER_LABEL[contract.trigger]}
          </Badge>
        )}
      </div>

      {contract.after ? (
        <div className="flex items-center gap-5">
          <SnapshotBox snap={contract.before} tone="before" />
          <span className="text-[20px] text-faint" aria-hidden>
            →
          </span>
          <SnapshotBox snap={contract.after} tone="after" />
        </div>
      ) : (
        <div className="flex items-center gap-5">
          <SnapshotBox snap={contract.before} tone="after" />
          <span className="text-[13px] text-muted">최근 재평가 이후 변동 없음</span>
        </div>
      )}

      {contract.reason && (
        <p className="mt-4 text-[13px] font-bold text-grade-danger">⚠ 트리거: {contract.reason}</p>
      )}
      {contract.recommendations.length > 0 && (
        <p className="mt-1 text-[13px] text-body">
          권고: {contract.recommendations.join(" · ")}
        </p>
      )}

      {downgrade && (
        <div className="mt-4 flex items-center gap-3 border-t border-divider pt-4">
          {noticeSent ? (
            <p className="flex items-center gap-2 text-[13px] font-bold text-stage-notice">
              ✓ 임차인 고지 발송됨
              <span className="font-normal text-muted">
                — 세입자에게 위험등급 상승 안내가 전송되었습니다 (데모)
              </span>
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setNoticeSent(true)}
                className="h-9 rounded-lg bg-stage-notice px-4 text-[13px] font-bold text-white transition-colors duration-fast hover:opacity-90"
              >
                임차인 고지 발송
              </button>
              <span className="text-[12px] text-muted">
                임대인 위험등급 상승 — 세입자에게 즉시 안내
              </span>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
