import { useEffect, useState } from "react";
import { useMonitorContracts } from "@/entities/contract";
import { MonitorSearch, type MonitorFilter } from "@/features/monitor-search";
import { PageHeader } from "@/widgets/page-header";
import { MonitorCard, isDowngrade } from "@/widgets/monitor-card";
import { Card, EmptyState, ErrorState, Skeleton } from "@/shared/ui";

function useDebounced(value: string, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function MonitorPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MonitorFilter>("all");
  const q = useDebounced(query);

  // 기본은 변동 있는 계약만, 검색어가 있으면 무변동 계약도 포함해 검색
  const list = useMonitorContracts(q ? { q } : { changed: true });
  const all = useMonitorContracts({}); // 요약 스탯용 전체

  const filtered = (list.data ?? []).filter((c) => {
    if (filter === "downgrade") return isDowngrade(c);
    if (filter === "alert") return c.after !== null && !isDowngrade(c);
    return true;
  });

  const stats = {
    total: all.data?.length,
    downgrades: all.data?.filter(isDowngrade).length,
    alerts: all.data?.filter((c) => c.after !== null && !isDowngrade(c)).length,
  };

  return (
    <div>
      <PageHeader tabKey="monitor" />

      <div className="mb-5 grid grid-cols-3 gap-5">
        <StatCard label="관리중 계약" value={stats.total} unit="건" />
        <StatCard label="이번달 등급하락" value={stats.downgrades} unit="건" danger />
        <StatCard label="경보" value={stats.alerts} unit="건" />
      </div>

      <div className="mb-5">
        <MonitorSearch
          query={query}
          onQueryChange={setQuery}
          filter={filter}
          onFilterChange={setFilter}
        />
      </div>

      {list.isPending && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="space-y-4 p-6">
              <Skeleton className="h-5 w-2/3" />
              <div className="flex gap-5">
                <Skeleton className="h-[120px] w-[220px]" />
                <Skeleton className="h-[120px] w-[220px]" />
              </div>
            </Card>
          ))}
        </div>
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
          <div className="animate-fade-in space-y-4">
            {filtered.map((c) => (
              <MonitorCard key={c.contractId} contract={c} />
            ))}
          </div>
        ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  danger,
}: {
  label: string;
  value: number | undefined;
  unit: string;
  danger?: boolean;
}) {
  return (
    <Card className="p-5">
      <p className="text-[12px] font-bold text-muted">{label}</p>
      <p
        className={`num mt-1.5 text-[26px] ${
          danger && (value ?? 0) > 0 ? "text-grade-danger" : "text-slate"
        }`}
      >
        {value === undefined ? "—" : `${value}${unit}`}
      </p>
    </Card>
  );
}
