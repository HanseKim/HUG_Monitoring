import { NavLink } from "react-router-dom";
import { TABS } from "@/shared/config/tabs";
import { RegionSelect } from "@/features/region-select";
import ONJEON_LOGO from "@/shared/ui/ONJEON_LOGO.png";

/**
 * 관제 레일 — 내비게이션이 곧 파이프라인.
 * 스테이지 노드가 플로우 라인으로 이어지고, 마지막(회수)에서 첫(심사)으로
 * 점선 환류 표시가 돌아온다.
 */
export function Sidebar() {
  const stages = TABS.filter((t) => t.key !== "overview");
  const overview = TABS.find((t) => t.key === "overview")!;

  return (
    <aside className="print-hidden sticky top-0 flex h-screen w-[248px] shrink-0 flex-col bg-rail">
      <div className="px-6 pt-7 pb-5">
        <img src={ONJEON_LOGO} alt="ONJEON_LOGO" className="h-10 w-50" />
        <p className="mt-2.5 text-[11.5px] leading-relaxed text-rail-text">
          전세의 처음부터 끝까지, 온전하게
        </p>
      </div>

      <nav className="flex-1 px-3">
        {/* 플로우 개요 */}
        <NavLink
          to={overview.path}
          end
          className={({ isActive }) =>
            `mb-4 flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[13.5px] transition-colors duration-fast ${
              isActive
                ? "bg-rail-soft font-bold text-white"
                : "font-normal text-rail-text hover:bg-rail-soft/60 hover:text-white"
            }`
          }
        >
          <span className="num text-[10px] text-stage-data">LOOP</span>
          {overview.title}
        </NavLink>

        <p className="caption mb-2 px-3.5 !text-rail-text/70">리스크 파이프라인</p>

        {/* 스테이지 노드 + 플로우 라인 */}
        <div className="relative">
          <span
            aria-hidden
            className="absolute bottom-5 left-[22px] top-4 w-px bg-rail-line"
          />
          {stages.map((tab) => (
            <NavLink
              key={tab.key}
              to={tab.path}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-lg py-2.5 pl-3.5 pr-3 text-[13.5px] transition-colors duration-fast ${
                  isActive
                    ? "bg-rail-soft font-bold text-white"
                    : "font-normal text-rail-text hover:bg-rail-soft/60 hover:text-white"
                }`
              }
            >
              <span
                className={`relative z-10 h-[9px] w-[9px] shrink-0 rounded-full ring-4 ring-rail ${tab.accent.dot}`}
              />
              <span className="flex-1">{tab.title}</span>
              <span className="num text-[10px] text-rail-text/70">{tab.step}</span>
            </NavLink>
          ))}
          {/* 환류: 회수 → 심사 */}
          <div className="mt-1 flex items-center gap-2 pl-[17px]">
            <span
              aria-hidden
              className="h-4 w-[11px] rounded-bl-md border-b border-l border-dashed border-stage-data/70"
            />
            <p className="text-[11px] leading-tight text-rail-text/80">
              회수 결과가 <span className="text-stage-data">심사 데이터로 환류</span>
            </p>
          </div>
        </div>
      </nav>

      <div className="mx-5 border-t border-rail-line" />
      <RegionSelect />
      <footer className="border-t border-rail-line px-6 py-4 text-[11px] text-rail-text/70">
        DIVE 2026 · HUG × 아이엔
      </footer>
    </aside>
  );
}
