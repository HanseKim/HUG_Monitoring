import { useState } from "react";
import type { MonitorContract, Snapshot, TriggerType } from "@/entities/contract";
import { formatPct } from "@/shared/lib/format";
import { gradeByIdx, gradeDelta, gradeFromPd } from "@/shared/config/grades";
import { GradeTrack } from "./GradeTrack";

const TRIGGER_LABEL: Record<TriggerType, string> = {
  T1_정기: "T1 정기",
  T2_금리: "T2 금리",
  T3_등기변동: "T3 등기변동",
  T4_지역리스크: "T4 지역리스크",
};

/** 스냅샷의 등급 idx — 신필드 우선, 없으면 riskPct 환산 (하위 호환) */
export const snapshotIdx = (s: Snapshot): number =>
  s.gradeIdx ?? gradeFromPd(s.riskPct).idx;

/** 강등 델타 — 정렬 키. 변동 없으면 null */
export const contractDelta = (c: MonitorContract) =>
  c.after ? gradeDelta(snapshotIdx(c.before), snapshotIdx(c.after)) : null;

export const isDowngrade = (c: MonitorContract) =>
  contractDelta(c)?.direction === "강등";

/** 워크리스트 행 — 강등 폭이 곧 처리 우선순위 */
export function MonitorRow({ contract }: { contract: MonitorContract }) {
  const delta = contractDelta(contract);
  const downgrade = delta?.direction === "강등";
  const [noticeSent, setNoticeSent] = useState(false);

  const fromIdx = snapshotIdx(contract.before);
  const toIdx = contract.after ? snapshotIdx(contract.after) : fromIdx;

  return (
    <li className="px-6 py-5 transition-colors duration-fast hover:bg-canvas/70">
      <div className="flex items-start gap-6">
        {/* 강등 폭 — 우선순위 신호 */}
        <div className="w-16 shrink-0 pt-0.5">
          {downgrade ? (
            <>
              <p className="num text-[20px] font-semibold leading-none text-grade-danger">
                ▾{delta!.delta}
              </p>
              <p className="mt-1 text-[11px] leading-tight text-muted">등급 강등</p>
            </>
          ) : delta ? (
            <>
              <p className="num text-[20px] font-semibold leading-none text-grade-caution">!</p>
              <p className="mt-1 text-[11px] leading-tight text-muted">경보</p>
            </>
          ) : (
            <p className="num pt-1 text-[14px] text-faint">—</p>
          )}
        </div>

        {/* 계약 정보 */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="text-[14px] font-bold text-ink">{contract.address}</p>
            <span className="text-[12px] text-muted">
              {contract.houseType} · {contract.contractId}
            </span>
            {contract.trigger && (
              <span className="rounded-[3px] border border-divider px-1.5 py-px text-[11px] text-label">
                {TRIGGER_LABEL[contract.trigger]}
              </span>
            )}
            {delta?.crossedToSpeculative && (
              <span className="rounded-[3px] bg-grade-danger-soft px-1.5 py-px text-[11px] font-bold text-grade-danger">
                투기등급 진입
              </span>
            )}
          </div>
          {contract.reason ? (
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-body">{contract.reason}</p>
          ) : (
            <p className="mt-1.5 text-[12.5px] text-muted">최근 재평가 이후 변동 없음</p>
          )}
          {contract.recommendations.length > 0 && (
            <p className="mt-0.5 text-[12px] text-muted">
              권고 · {contract.recommendations.join(" · ")}
            </p>
          )}
        </div>

        {/* 13등급 트랙 */}
        <div className="w-[220px] shrink-0 pt-1">
          <GradeTrack from={fromIdx} to={toIdx} />
          <div className="num mt-2 flex items-baseline justify-between text-[12px]">
            <span className="text-muted">
              {gradeByIdx(fromIdx).name} {formatPct(contract.before.riskPct)}
            </span>
            {contract.after && (
              <span
                className={`font-semibold ${downgrade ? "text-grade-danger" : "text-ink"}`}
              >
                {gradeByIdx(toIdx).name} {formatPct(contract.after.riskPct)}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex justify-between text-[10.5px] text-faint">
            <span>{contract.before.snapshotAt}</span>
            {contract.after && <span>{contract.after.snapshotAt}</span>}
          </div>
        </div>

        {/* 임차인 고지 */}
        <div className="w-[104px] shrink-0 pt-0.5 text-right">
          {downgrade &&
            (noticeSent ? (
              <p className="text-[12px] font-bold text-stage-notice">✓ 고지됨</p>
            ) : (
              <button
                type="button"
                onClick={() => setNoticeSent(true)}
                className="rounded-md border border-stage-notice px-3 py-1.5 text-[12px] font-bold text-stage-notice transition-colors duration-fast hover:bg-stage-notice hover:text-white"
              >
                임차인 고지
              </button>
            ))}
        </div>
      </div>
    </li>
  );
}
