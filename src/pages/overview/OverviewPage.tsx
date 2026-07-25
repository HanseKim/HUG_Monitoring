import { Link } from "react-router-dom";
import { useMonitorContracts } from "@/entities/contract";
import { isDowngrade } from "@/widgets/monitor-card";
import { Card } from "@/shared/ui";

/**
 * 플로우 개요 — 제품의 본질(닫힌 루프)을 첫 화면으로.
 * 심사 → 모니터링 → (고지 · 정책 · 전략) → 대위변제 → 회수 → 데이터 환류.
 */
export function OverviewPage() {
  const all = useMonitorContracts({});
  const contracts = all.data ?? [];
  const downgrades = contracts.filter(isDowngrade).length;
  const alerts = contracts.filter((c) => c.after !== null && !isDowngrade(c)).length;

  return (
    <div>
      <header className="mb-8">
        <p className="caption">HUG 내부 리스크 관리 · 모니터링 → 회수 → 재학습 루프</p>
        <h2 className="mt-2 text-[26px] font-bold leading-snug tracking-tight text-ink">
          사고가 나도 끝이 아니다
          <br />
          회수 결과가 다시 심사 모델을 고도화한다
        </h2>
      </header>

      {/* 루프 다이어그램 */}
      <section className="rounded-xl bg-rail p-8 text-white">
        <div className="flex items-center justify-between">
          <p className="caption !text-rail-text">리스크 파이프라인</p>
          <p className="text-[11.5px] text-stage-data">
            ↻ 회수 결과가 최초 심사 데이터로 환류 → 등급 엔진 고도화
          </p>
        </div>

        <div className="mt-6 grid grid-cols-[1fr_auto_1.2fr_auto_1fr_auto_1fr] items-stretch gap-0">
          <FlowNode
            to="/assess"
            dot="bg-stage-assess"
            title="심사·등급"
            desc="126%룰 게이트 → 모델1 최초 등급"
            value="신규 인수"
          />
          <FlowArrow />
          <FlowNode
            to="/monitor"
            dot="bg-stage-monitor"
            title="상시 모니터링"
            desc="임대인 변경 체크 → 재등급"
            value={all.isPending ? "—" : `관리 ${contracts.length}건`}
            branches={[
              { dot: "bg-stage-notice", label: `임차인 고지 ${downgrades}건 대기` },
              { dot: "bg-stage-policy", label: `정책 신호 ${alerts}건` },
              { dot: "bg-stage-strategy", label: "회수 전략 사전 설계" },
            ]}
          />
          <FlowArrow label="대위변제" />
          <FlowNode
            to="/recovery"
            dot="bg-stage-incident"
            title="회수 경로 분기"
            desc="든든전세(자산화) vs 경매 배당"
            value="사고 확정 시"
            branches={[
              { dot: "bg-stage-safe", label: "든든전세 · 셀프낙찰" },
              { dot: "bg-stage-auction", label: "경매 배당 대기" },
            ]}
          />
          <FlowArrow />
          <FlowNode
            to="/policy"
            dot="bg-stage-data"
            title="데이터 축적"
            desc="실제 회수율·소요기간 = 정답 데이터"
            value="누적 1,284건*"
          />
        </div>
        <p className="mt-4 text-right text-[10.5px] text-rail-text/60">* 데모용 목데이터</p>
      </section>

      {/* 왜 루프인가 */}
      <Card className="mt-6 p-7">
        <h3 className="text-[15px] font-bold text-ink">왜 이게 "루프"인가</h3>
        <div className="mt-3 space-y-2.5 text-[13.5px] leading-relaxed text-body">
          <p>
            <b className="text-ink">HUG의 위험관리는 사고가 나는 순간 끝나지 않습니다.</b>{" "}
            126%룰을 통과한 계약이 최초 등급을 받고, 상시 모니터링이 이를 재산정하며, 재산정된
            위험도는 임차인 고지 · 내부 정책 · 채권회수 전략 세 갈래로 흐릅니다.
          </p>
          <p>
            실제로 대위변제가 발생하면 미리 설계한 방향에 따라{" "}
            <b className="text-ink">든든전세(셀프낙찰로 자산화)</b> 또는{" "}
            <b className="text-ink">경매 배당</b> 경로로 라우팅되고, 두 경로 모두 실제
            회수율·소요기간이라는 정답 데이터를 만들어냅니다.
          </p>
          <p>
            이 데이터는 종결되지 않고 다시 최초 심사(모델1)의 학습 데이터로 환류되어, 예측한
            위험도가 실제 회수 결과와 얼마나 맞았는지를 검증하고 등급 엔진 자체를 고도화합니다 —
            사전(심사)과 사후(회수)가 서로를 개선하는 닫힌 루프(closed loop)입니다.
          </p>
        </div>
      </Card>
    </div>
  );
}

function FlowNode({
  to,
  dot,
  title,
  desc,
  value,
  branches,
}: {
  to: string;
  dot: string;
  title: string;
  desc: string;
  value: string;
  branches?: { dot: string; label: string }[];
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-lg border border-rail-line bg-rail-soft/60 p-4 transition-colors duration-fast hover:bg-rail-soft"
    >
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        <span className="text-[14px] font-bold text-white">{title}</span>
      </div>
      <p className="mt-1.5 flex-1 text-[11.5px] leading-relaxed text-rail-text">{desc}</p>
      <p className="num mt-3 text-[13px] text-white">{value}</p>
      {branches && (
        <ul className="mt-3 space-y-1.5 border-t border-rail-line pt-3">
          {branches.map((b) => (
            <li key={b.label} className="flex items-center gap-1.5 text-[11px] text-rail-text">
              <span className={`h-1.5 w-1.5 rounded-full ${b.dot}`} />
              {b.label}
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}

function FlowArrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-2">
      {label && <span className="mb-1 text-[10px] text-stage-incident">{label}</span>}
      <span aria-hidden className="text-[16px] text-rail-text">
        →
      </span>
    </div>
  );
}
