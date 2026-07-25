type Props<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  /** 활성 항목 글자색 클래스 (예: "text-underwrite") */
  accentText?: string;
};

/** 세그먼티드 컨트롤 — 입력 모드 전환용 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accentText = "text-primary",
}: Props<T>) {
  return (
    <div className="inline-flex rounded-lg border border-divider bg-canvas p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-md px-4 py-1.5 text-[14px] transition-colors duration-fast ${
            value === o.value
              ? `bg-surface font-bold ${accentText}`
              : "font-normal text-muted hover:text-label"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
