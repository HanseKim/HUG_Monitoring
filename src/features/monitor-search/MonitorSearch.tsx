import { Input } from "@/shared/ui";
import { getTab } from "@/shared/config/tabs";

export type MonitorFilter = "all" | "downgrade" | "alert";

const FILTERS: { value: MonitorFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "downgrade", label: "등급하락만" },
  { value: "alert", label: "경보만" },
];

type Props = {
  query: string;
  onQueryChange: (q: string) => void;
  filter: MonitorFilter;
  onFilterChange: (f: MonitorFilter) => void;
};

export function MonitorSearch({ query, onQueryChange, filter, onFilterChange }: Props) {
  const accent = getTab("monitor").accent;
  return (
    <div className="flex items-center gap-4">
      <div className="w-[360px]">
        <Input
          focusRing={accent.focusRing}
          placeholder="주소 또는 계약ID 검색 (무변동 계약 포함)"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onFilterChange(f.value)}
            className={`rounded-[3px] border px-3.5 py-1.5 text-[13px] transition-colors duration-fast ${
              filter === f.value
                ? "border-monitor bg-monitor-soft font-bold text-monitor"
                : "border-hairline bg-surface text-muted hover:text-label"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
