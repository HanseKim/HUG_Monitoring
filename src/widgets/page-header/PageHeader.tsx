import { getTab, type TabKey } from "@/shared/config/tabs";

/** 단계 헤더 — 파이프라인 순번 + 제목. 순번은 실제 업무 순서다. */
export function PageHeader({ tabKey }: { tabKey: TabKey }) {
  const tab = getTab(tabKey);
  return (
    <header className="print-hidden mb-7">
      <div className="flex items-center gap-2.5">
        <span className={`h-2 w-2 rounded-full ${tab.accent.dot}`} />
        <span className="num text-[11px] text-muted">{tab.step}</span>
        <h2 className="text-section">{tab.title}</h2>
      </div>
      <p className="mt-1.5 text-[14px] text-body">{tab.description}</p>
    </header>
  );
}
