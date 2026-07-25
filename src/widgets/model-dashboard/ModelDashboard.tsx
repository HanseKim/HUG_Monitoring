import type { ModelDashboard as Dash } from "@/entities/contract";
import { WATCH_START, gradeByIdx } from "@/shared/config/grades";
import { Card, Skeleton, Table, Th, Td } from "@/shared/ui";
import { comma, formatPct } from "@/shared/lib/format";

const ZONE_BG: Record<string, string> = {
  안심: "bg-grade-safe",
  주의: "bg-grade-caution",
  위험: "bg-grade-danger",
};
const ZONE_TEXT: Record<string, string> = {
  안심: "text-grade-safe",
  주의: "text-grade-caution",
  위험: "text-grade-danger",
};

export function ModelDashboardSkeleton() {
  return (
    <div className="space-y-5">
      <section className="rounded-xl bg-rail p-7">
        <Skeleton className="h-4 w-40 !bg-rail-line" />
        <Skeleton className="mt-4 h-10 w-2/3 !bg-rail-line" />
        <Skeleton className="mt-6 h-24 w-full !bg-rail-line" />
      </section>
      <Card className="p-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-4 h-[220px] w-full" />
      </Card>
    </div>
  );
}

/**
 * 모델 산출물 기반 리스크 현황.
 * 서사: "어느 등급 구간에서 사고가 실제로 발생했는가" — 워치리스트 집중도가 중심.
 * 예상손실·회수율 등 모델이 산출하지 않는 지표는 싣지 않는다.
 */
export function ModelDashboard({ data }: { data: Dash }) {
  const { watch, grades, performance, dataset } = data;

  // 사고 건수 = 계약수 × 실측 사고율 (등급별)
  const withIncidents = grades.map((g) => ({
    ...g,
    incidents: Math.round((g.count * g.actualRate) / 100),
    zone: gradeByIdx(g.idx).legacy,
    isWatch: g.idx >= WATCH_START,
  }));
  const totalContracts = withIncidents.reduce((s, g) => s + g.count, 0);
  const totalIncidents = withIncidents.reduce((s, g) => s + g.incidents, 0);
  const maxRate = Math.max(...withIncidents.map((g) => g.actualRate));

  // 누적 포착 곡선 — 위험한 등급부터 훑었을 때 계약 x%로 사고 y%를 잡는가
  const desc = [...withIncidents].reverse();
  let cc = 0;
  let ci = 0;
  const curve = desc.map((g) => {
    cc += g.count;
    ci += g.incidents;
    return {
      name: g.name,
      contractShare: (cc / totalContracts) * 100,
      captureShare: (ci / totalIncidents) * 100,
      isWatchEdge: g.idx === WATCH_START,
    };
  });

  return (
    <div className="space-y-5">
      {/* 헤드라인 — 위험 집중도 */}
      <section className="rounded-xl bg-rail px-8 py-7 text-white">
        <div className="flex items-baseline justify-between">
          <p className="caption !text-rail-text">
            모델1 위험등급 · 2024 시험셋 {comma(dataset.testCount)}건 실측
          </p>
          <p className="text-[11px] text-rail-text/60">
            학습 {comma(dataset.total)}건 · 전체 사고율 {formatPct(dataset.incidentRate)}
          </p>
        </div>

        <h3 className="mt-3 text-[25px] font-bold leading-snug tracking-tight">
          하위 <span className="num text-grade-caution">{formatPct(watch.contractShare)}</span>의
          워치리스트에서
          <br />
          전체 사고의{" "}
          <span className="num text-grade-danger">{formatPct(watch.captureRate)}</span>가
          발생했습니다
        </h3>

        {/* 계약 비중 vs 사고 비중 비교 막대 */}
        <div className="mt-6 space-y-3">
          <ShareBar
            label={`워치리스트 (${watch.thresholdGrade} 이하) 계약 비중`}
            pct={watch.contractShare}
            barCls="bg-rail-text/60"
          />
          <ShareBar
            label="그 안에서 발생한 사고 비중"
            pct={watch.captureRate}
            barCls="bg-grade-danger"
          />
        </div>

        <div className="mt-6 grid grid-cols-4 border-t border-rail-line pt-5">
          <Metric
            label="워치리스트 사고율"
            value={formatPct(watch.watchRate)}
            sub={`비워치 ${formatPct(watch.nonWatchRate)}`}
            tone="danger"
          />
          <Metric
            label="위험 배수"
            value={`${watch.lift}배`}
            sub="워치 ÷ 비워치 사고율"
            divider
          />
          <Metric
            label="사고 포착률"
            value={formatPct(watch.captureRate)}
            sub={`계약 ${formatPct(watch.contractShare)}만 열람`}
            divider
          />
          <Metric
            label="변별력 AUC"
            value={performance.auc.toFixed(4)}
            sub={`Brier ${performance.brier.toFixed(5)} · 단조성 ${performance.gradeMonotonicity.toFixed(4)}`}
            divider
          />
        </div>
      </section>

      {/* 등급별 실측 사고율 */}
      <Card className="p-7">
        <div className="flex items-baseline justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-ink">등급별 실제 사고율</h3>
            <p className="mt-1 text-[12.5px] text-muted">
              막대는 2024년 실제 사고율, 점은 모델 예측 PD. 두 값이 붙어 있을수록 등급이 신뢰됩니다.
            </p>
          </div>
          <p className="caption">
            AAA → C · 워치 경계 {watch.thresholdGrade}
          </p>
        </div>

        <div className="mt-6 flex items-end gap-1.5">
          {withIncidents.map((g) => (
            <div key={g.idx} className="group relative flex-1">
              <div className="relative h-[150px]">
                {/* 실측 사고율 막대 */}
                <div
                  className={`absolute bottom-0 w-full rounded-t-[2px] ${ZONE_BG[g.zone]} ${
                    g.isWatch ? "" : "opacity-45"
                  }`}
                  style={{ height: `${(g.actualRate / maxRate) * 100}%` }}
                />
                {/* 예측 PD 점 */}
                <span
                  className="absolute left-1/2 h-[7px] w-[7px] -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-surface bg-ink"
                  style={{ bottom: `${(g.predictedPd / maxRate) * 100}%` }}
                  title={`예측 PD ${g.predictedPd}%`}
                />
              </div>
              <p
                className={`num mt-2 text-center text-[10.5px] ${
                  g.isWatch ? `font-semibold ${ZONE_TEXT[g.zone]}` : "text-muted"
                }`}
              >
                {formatPct(g.actualRate, g.actualRate >= 10 ? 0 : 1)}
              </p>
              <p
                className={`num mt-0.5 text-center text-[10.5px] ${
                  g.isWatch ? "font-semibold text-ink" : "text-faint"
                }`}
              >
                {g.name}
              </p>
              <p className="num mt-0.5 text-center text-[9.5px] text-faint">{comma(g.count)}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-5 border-t border-divider pt-4 text-[11.5px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-4 rounded-sm bg-grade-danger" /> 실제 사고율
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-ink" /> 모델 예측 PD
          </span>
          <span className="ml-auto">
            워치 경계({watch.thresholdGrade}) 아래부터 진하게 표시 · 하단 숫자는 계약 건수
          </span>
        </div>
      </Card>

      {/* 누적 포착 + 등급 표 */}
      <div className="grid grid-cols-[1fr_1.1fr] gap-5">
        <Card className="p-7">
          <h3 className="text-[15px] font-bold text-ink">위험 순 열람 시 사고 포착</h3>
          <p className="mt-1 text-[12.5px] text-muted">
            C등급부터 위험한 순으로 훑을 때, 계약 몇 %를 보면 사고 몇 %를 잡는가.
          </p>
          <div className="mt-6 space-y-2.5">
            {curve
              .filter((_, i) => i % 2 === 0 || curve[i].isWatchEdge)
              .slice(0, 9)
              .map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span
                    className={`num w-11 shrink-0 text-[11.5px] ${
                      p.isWatchEdge ? "font-bold text-grade-danger" : "text-muted"
                    }`}
                  >
                    {p.name}
                  </span>
                  <div className="relative h-[18px] flex-1 overflow-hidden rounded-[3px] bg-canvas">
                    <div
                      className="absolute inset-y-0 left-0 bg-grade-danger/25"
                      style={{ width: `${p.captureShare}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 border-r-2 border-ink/40"
                      style={{ width: `${p.contractShare}%` }}
                    />
                  </div>
                  <span className="num w-[104px] shrink-0 text-right text-[11.5px] text-body">
                    {formatPct(p.contractShare, 0)} → {formatPct(p.captureShare, 0)}
                  </span>
                </div>
              ))}
          </div>
          <p className="mt-5 rounded-lg bg-grade-danger-soft px-4 py-3 text-[12.5px] leading-relaxed text-body">
            워치 경계 <b className="text-ink">{watch.thresholdGrade}</b>까지 내려오면 계약{" "}
            <b className="num text-ink">{formatPct(watch.contractShare)}</b> 열람으로 사고{" "}
            <b className="num text-grade-danger">{formatPct(watch.captureRate)}</b>를 포착합니다.
          </p>
        </Card>

        <Card className="p-7">
          <h3 className="text-[15px] font-bold text-ink">등급별 분포 상세</h3>
          <p className="mt-1 text-[12.5px] text-muted">
            실제÷예측이 1에 가까울수록 보정이 잘 맞은 구간입니다.
          </p>
          <div className="mt-4 max-h-[330px] overflow-y-auto">
            <Table>
              <thead className="sticky top-0 bg-surface">
                <tr>
                  <Th>등급</Th>
                  <Th className="text-right">계약</Th>
                  <Th className="text-right">사고</Th>
                  <Th className="text-right">실제 사고율</Th>
                  <Th className="text-right">예측 PD</Th>
                  <Th className="text-right">실제÷예측</Th>
                </tr>
              </thead>
              <tbody>
                {withIncidents
                  .filter((g) => g.count > 0)
                  .map((g) => {
                    const ratio = g.predictedPd > 0 ? g.actualRate / g.predictedPd : null;
                    return (
                      <tr key={g.idx} className={g.isWatch ? "bg-grade-danger-soft/40" : ""}>
                        <Td>
                          <span
                            className={`num text-[12.5px] ${
                              g.isWatch ? `font-bold ${ZONE_TEXT[g.zone]}` : "text-label"
                            }`}
                          >
                            {g.name}
                          </span>
                        </Td>
                        <Td className="num text-right text-[12.5px]">{comma(g.count)}</Td>
                        <Td className="num text-right text-[12.5px]">{comma(g.incidents)}</Td>
                        <Td className="num text-right text-[12.5px] font-semibold">
                          {formatPct(g.actualRate)}
                        </Td>
                        <Td className="num text-right text-[12.5px] text-muted">
                          {formatPct(g.predictedPd)}
                        </Td>
                        <Td
                          className={`num text-right text-[12.5px] ${
                            ratio !== null && (ratio > 1.3 || ratio < 0.7)
                              ? "text-grade-caution"
                              : "text-muted"
                          }`}
                        >
                          {ratio === null ? "—" : ratio.toFixed(2)}
                        </Td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ShareBar({ label, pct, barCls }: { label: string; pct: number; barCls: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-[220px] shrink-0 text-[12.5px] text-rail-text">{label}</span>
      <div className="h-[22px] flex-1 overflow-hidden rounded-[3px] bg-rail-soft">
        <div className={`h-full ${barCls}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="num w-14 shrink-0 text-right text-[15px] font-semibold">
        {formatPct(pct)}
      </span>
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
  tone,
  divider,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "danger";
  divider?: boolean;
}) {
  return (
    <div className={divider ? "border-l border-rail-line pl-6" : ""}>
      <p className="caption !text-rail-text">{label}</p>
      <p
        className={`num mt-1.5 text-[25px] leading-tight ${
          tone === "danger" ? "text-grade-danger" : "text-white"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-[11.5px] text-rail-text/70">{sub}</p>
    </div>
  );
}
