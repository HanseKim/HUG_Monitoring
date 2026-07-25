import { useState } from "react";
import type { MonitorContract, Snapshot, TriggerType } from "@/entities/contract";
import { Badge, Card, Grade13Badge } from "@/shared/ui";
import { formatPct } from "@/shared/lib/format";
import { gradeDelta, gradeFromPd } from "@/shared/config/grades";

const TRIGGER_LABEL: Record<TriggerType, string> = {
  T1_정기: "T1 정기",
  T2_금리: "T2 금리",
  T3_등기변동: "T3 등기변동",
  T4_지역리스크: "T4 지역리스크",
};

/** 스냅샷의 등급 idx — 신필드 우선, 없으면 riskPct 환산 (하위 호환) */
export const snapshotIdx = (s: Snapshot): number =>
  s.gradeIdx ?? gradeFromPd(s.riskPct).idx;

/** 강등 델타 — 정렬 키. 변동 없으면 0 */
export const contractDelta = (c: MonitorContract) =>
  c.after ? gradeDelta(snapshotIdx(c.before), snapshotIdx(c.after)) : null;

export const isDowngrade = (c: MonitorContract) =>
  contractDelta(c)?.direction === "강등";

function SnapshotBox({ snap, tone }: { snap: Snapshot; tone: "before" | "after" }) {
  const mutedTone = tone === "before";
  return (
    <div
      className={`w-[230px] rounded-lg border p-4 ${
        mutedTone ? "border-divider bg-canvas" : "border-divider bg-surface"
      }`}
    >
      <p className="mb-2 text-[11px] font-bold text-muted">
        {mutedTone ? "변동 전" : "변동 후"}
      </p>
      <div className={`flex items-center gap-2.5 ${mutedTone ? "opacity-70" : ""}`}>
        <Grade13Badge idx={snapshotIdx(snap)} />
        <span
          className={`num text-[19px] ${mutedTone ? "text-muted" : "font-semibold text-ink"}`}
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
  const delta = contractDelta(contract);
  const downgrade = delta?.direction === "강등";
  // 임차인 고지 — 등급 하락 시 세입자에게 즉시 안내 (데모: 로컬 상태)
  const [noticeSent, setNoticeSent] = useState(false);

  return (
    <Card className={`p-6 ${downgrade ? "border-t-[3px] border-t-grade-danger" : ""}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[14px] font-bold text-ink">
          {contract.address}
          <span className="ml-2 font-normal text-muted">
            · {contract.houseType} · {contract.contractId}
          </span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {delta?.crossedToSpeculative && (
            <Badge className="bg-grade-danger-soft text-grade-danger">투기등급 진입</Badge>
          )}
          {contract.trigger && (
            <Badge className="bg-stage-monitor-soft text-stage-monitor">
              {TRIGGER_LABEL[contract.trigger]}
            </Badge>
          )}
        </div>
      </div>

      {contract.after ? (
        <div className="flex items-center gap-4">
          <SnapshotBox snap={contract.before} tone="before" />
          <div className="flex flex-col items-center px-1">
            <span className="text-[18px] text-faint" aria-hidden>
              →
            </span>
            {delta && delta.delta !== 0 && (
              <span
                className={`num mt-1 whitespace-nowrap text-[12px] font-semibold ${
                  downgrade ? "text-grade-danger" : "text-grade-safe"
                }`}
              >
                {Math.abs(delta.delta)}등급 {delta.direction}
              </span>
            )}
          </div>
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
