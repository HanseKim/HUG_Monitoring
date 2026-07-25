import { getTab, type TabKey } from "@/shared/config/tabs";

/** 탭 공통 헤더 — 제목 + 한 줄 설명 + soft색 얇은 배너 */
export function PageHeader({ tabKey }: { tabKey: TabKey }) {
  const tab = getTab(tabKey);
  return (
    <header className="print-hidden mb-6">
      <h2 className="text-section">{tab.title}</h2>
      <p className="mt-1 text-[14px] text-body">{tab.description}</p>
      <div className={`mt-4 h-1.5 rounded-full ${tab.accent.softBg}`} />
    </header>
  );
}
