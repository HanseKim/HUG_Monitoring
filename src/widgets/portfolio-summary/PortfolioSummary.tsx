import type { PortfolioSummary as Summary } from "@/entities/contract";
import { pathLabel, type RecoveryPath } from "@/entities/recovery-case";
import { gradeByIdx } from "@/shared/config/grades";
import { Skeleton } from "@/shared/ui";
import { comma, formatKRWShort, formatPct } from "@/shared/lib/format";

const ZONE_BG: Record<string, string> = {
  안심: "bg-grade-safe",
  주의: "bg-grade-caution",
  위험: "bg-grade-danger",
};

const PATH_BG: Record<RecoveryPath, string> = {
  셀프낙찰: "bg-stage-safe",
  배당대기: "bg-stage-auction",
  협의매입: "bg-stage-notice",
  캠코공매: "bg-stage-incident",
  재산추적: "bg-stage-strategy",
};

/** 조원 단위 축약 — 포트폴리오 규모 표기용 */
const formatJo = (n: number): string => {
  const jo = Math.floor(n / 1_0000_0000_0000);
  const eok = Math.round((n % 1_0000_0000_0000) / 100_000_000);
  if (jo > 0) return `${jo}조 ${comma(eok)}억원`;
  return `${comma(eok)}억원`;
};

export function PortfolioSummarySkeleton() {
  return (
    <section className="rounded-xl bg-rail p-7">
      <div className="grid grid-cols-4 gap-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-3 w-24 !bg-rail-line" />
            <Skeleton className="h-8 w-32 !bg-rail-line" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-7 h-16 w-full !bg-rail-line" />
    </section>
  );
}

/**
 * 포트폴리오 리스크 요약 — HUG 전체 관점의 손실·회수·등급 현황.
 * 재산정 결과가 기관 단위 숫자로 어떻게 집계되는지를 한 화면에 담는다.
 */
export function PortfolioSummary({ data }: { data: Summary }) {
  const { el, recovery, grades, paths, migration } = data;
  const investCount = grades.filter((g) => g.idx <= 5).reduce((s, g) => s + g.count, 0);
  const specCount = data.contractCount - investCount;
  const maxGrade = Math.max(...grades.map((g) => g.count));
  const totalPaths = paths.reduce((s, p) => s + p.count, 0);
  const recoveredSum = paths.reduce((s, p) => s + p.recoveredAmount, 0);

  return (
    <section className="rounded-xl bg-rail px-7 py-6 text-white">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="caption !text-rail-text">포트폴리오 리스크 요약</p>
          <p className="mt-0.5 text-[12px] text-rail-text/70">
            기준일 {data.asOf} · 관리 계약 {comma(data.contractCount)}건 · 익스포저{" "}
            {formatJo(data.totalExposure)}
          </p>
        </div>
        <p className="text-[11px] text-rail-text/60">데모용 목데이터</p>
      </div>

      {/* 핵심 수치 4 — 카드 없이 세로 구분선으로만 구획 */}
      <div className="mt-5 grid grid-cols-4 border-y border-rail-line py-5">
        <Metric
          label="올해 누적 예상손실"
          value={formatJo(el.ytd)}
          sub={`실현손실 ${formatJo(el.realizedYtd)} · 미실현 ${formatJo(el.ytd - el.realizedYtd)}`}
        />
        <Metric
          label="이번달 예상손실"
          value={formatJo(el.month)}
          sub={`전월 대비 ${el.momDelta >= 0 ? "+" : "−"}${formatJo(Math.abs(el.momDelta))}`}
          subTone={el.momDelta >= 0 ? "bad" : "good"}
          divider
        />
        <Metric
          label="실현 회수율"
          value={formatPct(recovery.actualYtd)}
          sub={`전월 대비 ${recovery.momDelta >= 0 ? "+" : "−"}${Math.abs(recovery.momDelta)}%p · 모델 예측 ${formatPct(recovery.predicted)}`}
          subTone={recovery.momDelta >= 0 ? "good" : "bad"}
          divider
        />
        <Metric
          label="평균 회수 소요"
          value={`${recovery.avgMonths}개월`}
          sub={`이번달 강등 ${migration.downgraded}건 · 투기등급 진입 ${migration.toSpeculative}건`}
          divider
        />
      </div>

      {/* 13등급 분포 */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <p className="caption !text-rail-text">등급별 계약 분포</p>
          <p className="num text-[11.5px] text-rail-text/80">
            투자등급 {comma(investCount)}건 ({formatPct((investCount / data.contractCount) * 100, 0)})
            <span className="mx-1.5 text-rail-line">|</span>
            투기등급 {comma(specCount)}건 ({formatPct((specCount / data.contractCount) * 100, 0)})
          </p>
        </div>
        <div className="mt-3 flex items-end gap-[5px]">
          {grades.map((g) => {
            const zone = gradeByIdx(g.idx).legacy;
            return (
              <div key={g.idx} className="group flex-1">
                <p className="num mb-1 text-center text-[10px] text-rail-text/70">
                  {comma(g.count)}
                </p>
                <div
                  className={`w-full rounded-t-[2px] ${ZONE_BG[zone]}`}
                  style={{ height: `${Math.max(3, (g.count / maxGrade) * 56)}px` }}
                  title={`${g.name} ${comma(g.count)}건 · ${formatJo(g.exposure)}`}
                />
                <p className="num mt-1.5 text-center text-[10.5px] text-rail-text">{g.name}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 회수 경로 분포 */}
      <div className="mt-6 border-t border-rail-line pt-5">
        <div className="flex items-baseline justify-between">
          <p className="caption !text-rail-text">올해 회수 경로 처리 현황</p>
          <p className="num text-[11.5px] text-rail-text/80">
            총 {comma(totalPaths)}건 · 회수액 {formatJo(recoveredSum)}
          </p>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-4">
          {paths.map((p) => (
            <div key={p.path}>
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${PATH_BG[p.path as RecoveryPath] ?? "bg-rail-line"}`}
                />
                <span className="text-[12px] text-rail-text">
                  {pathLabel(p.path as RecoveryPath)}
                </span>
              </div>
              <p className="num mt-1 text-[19px] leading-tight text-white">
                {comma(p.count)}
                <span className="ml-0.5 text-[12px] text-rail-text">채</span>
              </p>
              <p className="num mt-0.5 text-[11px] text-rail-text/70">
                {formatKRWShort(p.recoveredAmount)} 회수
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  sub,
  subTone,
  divider,
}: {
  label: string;
  value: string;
  sub: string;
  subTone?: "good" | "bad";
  divider?: boolean;
}) {
  const toneCls =
    subTone === "bad"
      ? "text-grade-danger"
      : subTone === "good"
        ? "text-grade-safe"
        : "text-rail-text/70";
  return (
    <div className={divider ? "border-l border-rail-line pl-7" : ""}>
      <p className="caption !text-rail-text">{label}</p>
      <p className="num mt-1.5 text-[27px] leading-tight text-white">{value}</p>
      <p className={`mt-1.5 text-[11.5px] leading-relaxed ${toneCls}`}>{sub}</p>
    </div>
  );
}
