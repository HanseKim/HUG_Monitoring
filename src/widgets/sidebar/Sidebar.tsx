import { NavLink } from "react-router-dom";
import { TABS } from "@/shared/config/tabs";
import { RegionSelect } from "@/features/region-select";

// 활성 표시용 정적 클래스 (Tailwind purge 대응)
const ACTIVE_BAR: Record<string, string> = {
  tenant: "bg-tenant",
  underwrite: "bg-underwrite",
  monitor: "bg-monitor",
  recovery: "bg-recovery",
};
const ACTIVE_ITEM: Record<string, string> = {
  tenant: "bg-tenant-soft text-tenant",
  underwrite: "bg-underwrite-soft text-underwrite",
  monitor: "bg-monitor-soft text-monitor",
  recovery: "bg-recovery-soft text-recovery",
};

export function Sidebar() {
  return (
    <aside className="print-hidden sticky top-0 flex h-screen w-[240px] shrink-0 flex-col border-r border-divider bg-surface">
      <div className="px-6 pb-5 pt-7">
        <h1 className="text-[22px] font-bold tracking-tight text-ink">온전</h1>
        <p className="mt-1 text-[12px] text-muted">
          전세의 처음부터 끝까지, 온전하게
        </p>
      </div>
      <div className="mx-6 border-t border-divider" />
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {TABS.map((tab) => (
          <NavLink
            key={tab.key}
            to={tab.path}
            className={({ isActive }) =>
              `relative flex items-center rounded-md px-4 py-2.5 text-[14px] transition-colors duration-fast ${
                isActive
                  ? `font-bold ${ACTIVE_ITEM[tab.key]}`
                  : "font-normal text-faint hover:bg-canvas hover:text-label"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r ${ACTIVE_BAR[tab.key]}`}
                  />
                )}
                {tab.title}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mx-6 border-t border-divider" />
      <RegionSelect />
      <footer className="border-t border-divider px-6 py-4 text-[12px] text-muted">
        DIVE 2026 · HUG × 아이엔
      </footer>
    </aside>
  );
}
