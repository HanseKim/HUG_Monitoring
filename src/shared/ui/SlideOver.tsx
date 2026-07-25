import type { ReactNode } from "react";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/** 우측 슬라이드오버 패널 */
export function SlideOver({ open, onClose, title, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-ink/30 transition-opacity duration-std"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-[520px] max-w-[90vw] flex-col border-l border-divider bg-surface">
        <header className="flex items-center justify-between border-b border-divider px-6 py-4">
          <h2 className="text-[16px] font-bold text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="text-[20px] leading-none text-muted hover:text-ink"
          >
            ×
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </aside>
    </div>
  );
}
