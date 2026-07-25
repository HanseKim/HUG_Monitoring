import { useEffect, useState } from "react";
import { useMonitorContracts, usePortfolioSummary } from "@/entities/contract";
import { PortfolioSummary, PortfolioSummarySkeleton } from "@/widgets/portfolio-summary";
import { PageHeader } from "@/widgets/page-header";
import { MonitorRow, isDowngrade, contractDelta } from "@/widgets/monitor-card";
import { Card, EmptyState, ErrorState, Skeleton } from "@/shared/ui";
import { getTab } from "@/shared/config/tabs";

type Filter = "all" | "downgrade" | "alert";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "downgrade", label: "등급하락" },
  { value: "alert", label: "경보" },
];

function useDebounced(value: string, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function MonitorPage() {
  const accent = getTab("monitor").accent;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const q = useDebounced(query);

  // 기본은 변동 있는 계약만, 검색어가 있으면 무변동 계약도 포함해 검색
  const list = useMonitorContracts(q ? { q } : { changed: true });
  const all = useMonitorContracts({}); // 요약 스탯용 전체
  const portfolio = usePortfolioSummary();

  // 기본 정렬: 강등 폭 내림차순 — 강등 폭이 곧 처리 우선순위
  const filtered = (list.data ?? [])
    .filter((c) => {
      if (filter === "downgrade") return isDowngrade(c);
      if (filter === "alert") return c.after !== null && !isDowngrade(c);
      return true;
    })
    .sort((a, b) => (contractDelta(b)?.delta ?? -99) - (contractDelta(a)?.delta ?? -99));

  const stats = [
    { label: "관리중 계약", value: all.data?.length },
    { label: "이번달 등급하락", value: all.data?.filter(isDowngrade).length, danger: true },
    {
      label: "그중 투기등급 진입",
      value: all.data?.filter((c) => contractDelta(c)?.crossedToSpeculative).length,
      danger: true,
    },
    {
      label: "경보",
      value: all.data?.filter((c) => c.after !== null && !isDowngrade(c)).length,
    },
  ];

  return (
    <div>
      {/* 인쇄 전용 표지 */}
      <div className="hidden print:mb-6 print:block">
        <p className="text-[11px] font-bold tracking-wide text-muted">
          온전 ONJEON · HUG 내부 리스크 관제
        </p>
        <h1 className="mt-1 text-[20px] font-bold text-ink">
          상시 모니터링 리스크 리포트
        </h1>
        <p className="mt-1 text-[11.5px] text-body">
          기준일 {portfolio.data?.asOf ?? "—"} · 강등 폭 내림차순 · 수치는 데모용 목데이터
        </p>
      </div>

      <div className="flex items-start justify-between">
        <PageHeader tabKey="monitor" />
        <button
          type="button"
          onClick={() => window.print()}
          className="print-hidden mt-1 rounded-md border border-hairline bg-surface px-4 py-2 text-[13px] font-bold text-label transition-colors duration-fast hover:bg-canvas"
        >
          PDF로 저장
        </button>
      </div>

      {/* 포트폴리오 전체 요약 */}
      <div className="mb-6">
        {portfolio.isPending && <PortfolioSummarySkeleton />}
        {portfolio.isSuccess && <PortfolioSummary data={portfolio.data} />}
        {portfolio.isError && (
          <p className="rounded-xl border border-divider bg-surface px-5 py-4 text-[13px] text-ink">
            포트폴리오 요약을 불러오지 못했습니다. 아래 계약 목록은 정상 표시됩니다.
          </p>
        )}
      </div>

      {/* 변동 계약 상태 스트립 */}
      <div className="mb-6 flex items-center border-y border-divider py-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`flex-1 ${i > 0 ? "border-l border-divider pl-8" : ""}`}>
            <p className="caption">{s.label}</p>
            <p
              className={`num mt-1 text-[26px] leading-tight ${
                s.danger && (s.value ?? 0) > 0 ? "text-grade-danger" : "text-ink"
              }`}
            >
              {s.value === undefined ? "—" : s.value}
              <span className="ml-0.5 text-[13px] text-muted">건</span>
            </p>
          </div>
        ))}
      </div>

      {/* 툴바 — 검색 + 필터 탭 */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <input
          className={`h-10 w-[340px] rounded-md border border-hairline bg-surface px-3.5 text-[13.5px] text-ink outline-none transition-colors duration-fast placeholder:text-faint ${accent.focusRing}`}
          placeholder="주소 또는 계약ID 검색 — 무변동 계약 포함"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex gap-6 border-b border-transparent">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`-mb-px border-b-2 pb-1.5 text-[13.5px] transition-colors duration-fast ${
                filter === f.value
                  ? `border-stage-monitor font-bold text-ink`
                  : "border-transparent text-muted hover:text-label"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 워크리스트 */}
      {list.isPending && (
        <Card className="divide-y divide-divider">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-6 px-6 py-5">
              <Skeleton className="h-8 w-16" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-[220px]" />
            </div>
          ))}
        </Card>
      )}
      {list.isError && (
        <ErrorState message={list.error.message} onRetry={() => list.refetch()} />
      )}
      {list.isSuccess &&
        (filtered.length === 0 ? (
          <EmptyState
            message={
              q
                ? `"${q}"에 해당하는 계약이 없습니다. 주소 일부나 계약ID로 다시 검색해보세요.`
                : "현재 조건에 해당하는 변동 계약이 없습니다. 필터를 전체로 바꾸거나 검색으로 무변동 계약을 확인할 수 있습니다."
            }
          />
        ) : (
          <Card className="animate-fade-in overflow-hidden">
            <div className="flex items-center justify-between border-b border-divider bg-canvas/60 px-6 py-2.5">
              <p className="caption">처리 우선순위 — 강등 폭 내림차순</p>
              <p className="caption">{filtered.length}건</p>
            </div>
            <ul className="divide-y divide-divider">
              {filtered.map((c) => (
                <MonitorRow key={c.contractId} contract={c} />
              ))}
            </ul>
          </Card>
        ))}
    </div>
  );
}
