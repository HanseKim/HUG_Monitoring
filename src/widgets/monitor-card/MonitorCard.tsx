import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { MonitorContract, Snapshot, TriggerType } from "@/entities/contract";
import { formatKRWShort, formatPct } from "@/shared/lib/format";
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

/** 워크리스트 행 — 등급·예상손실·회수율·회수전략 변동을 한 블록에 담는다 */
export function MonitorRow({ contract }: { contract: MonitorContract }) {
  const navigate = useNavigate();
  const delta = contractDelta(contract);
  const downgrade = delta?.direction === "강등";
  const [noticeSent, setNoticeSent] = useState(false);

  const fromIdx = snapshotIdx(contract.before);
  const toIdx = contract.after ? snapshotIdx(contract.after) : fromIdx;
  // 사기·사고 가능 구간(위험 B 이하 또는 투기등급 진입) 강등 → 회수 전략 사전 설계 대상
  const recoveryTarget = downgrade && (toIdx >= 8 || delta!.crossedToSpeculative);

  const b = contract.before;
  const a = contract.after;
  const elDelta = a?.el !== undefined && b.el !== undefined ? a.el - b.el : null;
  const rrDelta =
    a?.recoveryRate !== undefined && b.recoveryRate !== undefined
      ? Math.round((a.recoveryRate - b.recoveryRate) * 10) / 10
      : null;
  const strategyChanged =
    contract.strategyAfter != null && contract.strategyAfter !== contract.strategyBefore;

  return (
    <li className="break-inside-avoid px-7 py-6 transition-colors duration-fast hover:bg-canvas/50">
      {/* 1단 — 식별 · 등급 이동 · 액션 */}
      <div className="flex items-start gap-6">
        <div className="w-[70px] shrink-0 pt-0.5">
          {downgrade ? (
            <>
              <p className="num text-[22px] font-semibold leading-none text-grade-danger">
                ▾{delta!.delta}
              </p>
              <p className="mt-1.5 text-[11px] leading-tight text-muted">등급 강등</p>
            </>
          ) : delta ? (
            <>
              <p className="num text-[22px] font-semibold leading-none text-grade-caution">!</p>
              <p className="mt-1.5 text-[11px] leading-tight text-muted">경보</p>
            </>
          ) : (
            <p className="num pt-1 text-[15px] text-faint">—</p>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5">
            <p className="text-[15px] font-bold text-ink">{contract.address}</p>
            <span className="text-[12.5px] text-muted">
              {contract.houseType} · {contract.contractId}
              {contract.deposit !== undefined && ` · 보증금 ${formatKRWShort(contract.deposit)}`}
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
            <p className="mt-2 text-[13px] leading-relaxed text-body">{contract.reason}</p>
          ) : (
            <p className="mt-2 text-[13px] text-muted">최근 재평가 이후 변동 없음</p>
          )}
          {contract.recommendations.length > 0 && (
            <p className="mt-1 text-[12.5px] text-muted">
              권고 · {contract.recommendations.join(" · ")}
            </p>
          )}
        </div>

        <div className="w-[230px] shrink-0 pt-1">
          <GradeTrack from={fromIdx} to={toIdx} />
          <div className="num mt-2.5 flex items-baseline justify-between text-[12.5px]">
            <span className="text-muted">
              {gradeByIdx(fromIdx).name} {formatPct(b.riskPct)}
            </span>
            {a && (
              <span className={`font-semibold ${downgrade ? "text-grade-danger" : "text-ink"}`}>
                {gradeByIdx(toIdx).name} {formatPct(a.riskPct)}
              </span>
            )}
          </div>
          <div className="mt-1 flex justify-between text-[10.5px] text-faint">
            <span>{b.snapshotAt}</span>
            {a && <span>{a.snapshotAt}</span>}
          </div>
        </div>

        <div className="print-hidden flex w-[112px] shrink-0 flex-col items-end gap-2 pt-0.5">
          {downgrade &&
            (noticeSent ? (
              <p className="text-[12px] font-bold text-stage-notice">✓ 고지됨</p>
            ) : (
              <button
                type="button"
                onClick={() => setNoticeSent(true)}
                className="w-full rounded-md border border-stage-notice px-3 py-1.5 text-[12px] font-bold text-stage-notice transition-colors duration-fast hover:bg-stage-notice hover:text-white"
              >
                임차인 고지
              </button>
            ))}
          {recoveryTarget && (
            <button
              type="button"
              onClick={() => navigate("/recovery", { state: { fromContract: contract } })}
              className="w-full rounded-md bg-stage-safe px-3 py-1.5 text-[12px] font-bold text-white transition-colors duration-fast hover:opacity-90"
            >
              회수 전략 →
            </button>
          )}
        </div>
      </div>

      {/* 2단 — 재산정이 만든 경제적 변화 */}
      {a && (
        <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-divider">
          <DeltaBlock
            label="예상손실 EL"
            beforeText={b.el !== undefined ? formatKRWShort(b.el) : "—"}
            afterText={a.el !== undefined ? formatKRWShort(a.el) : "—"}
            deltaText={
              elDelta === null
                ? null
                : `${elDelta >= 0 ? "+" : "−"}${formatKRWShort(Math.abs(elDelta))}`
            }
            tone={elDelta !== null && elDelta > 0 ? "bad" : "good"}
          />
          <DeltaBlock
            label="예상 회수율"
            beforeText={b.recoveryRate !== undefined ? formatPct(b.recoveryRate) : "—"}
            afterText={a.recoveryRate !== undefined ? formatPct(a.recoveryRate) : "—"}
            deltaText={rrDelta === null ? null : `${rrDelta >= 0 ? "+" : "−"}${Math.abs(rrDelta)}%p`}
            tone={rrDelta !== null && rrDelta < 0 ? "bad" : "good"}
          />
          <DeltaBlock
            label="회수 전략"
            beforeText={contract.strategyBefore ?? "—"}
            afterText={contract.strategyAfter ?? contract.strategyBefore ?? "—"}
            deltaText={strategyChanged ? "전략 변경" : "유지"}
            tone={strategyChanged ? "bad" : "neutral"}
            text
          />
        </div>
      )}
    </li>
  );
}

function DeltaBlock({
  label,
  beforeText,
  afterText,
  deltaText,
  tone,
  text,
}: {
  label: string;
  beforeText: string;
  afterText: string;
  deltaText: string | null;
  tone: "good" | "bad" | "neutral";
  text?: boolean;
}) {
  const toneCls =
    tone === "bad" ? "text-grade-danger" : tone === "good" ? "text-grade-safe" : "text-muted";
  const valueCls = text ? "text-[13.5px] font-bold" : "num text-[19px]";
  return (
    <div className="bg-surface px-5 py-4">
      <div className="flex items-baseline justify-between">
        <p className="caption">{label}</p>
        {deltaText && (
          <span className={`text-[11.5px] font-bold ${toneCls}`}>{deltaText}</span>
        )}
      </div>
      <div className="mt-2.5 flex items-baseline gap-2.5">
        <span className={`${valueCls} text-muted`}>{beforeText}</span>
        <span className="text-[13px] text-faint" aria-hidden>
          →
        </span>
        <span className={`${valueCls} ${tone === "bad" ? "text-grade-danger" : "text-ink"}`}>
          {afterText}
        </span>
      </div>
    </div>
  );
}
