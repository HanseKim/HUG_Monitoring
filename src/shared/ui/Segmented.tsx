type Props<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  /** 활성 항목 글자색 클래스 (예: "text-underwrite") */
  accentText?: string;
  /** 활성 항목 밑줄색 클래스 (예: "border-underwrite") */
  accentBorder?: string;
};

/** 언더라인 탭 — 8percent 스타일의 플랫 모드 전환 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accentText = "text-primary",
  accentBorder = "border-primary",
}: Props<T>) {
  return (
    <div className="flex gap-7 border-b border-divider">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`-mb-px border-b-2 pb-2.5 pt-1 text-[15px] tracking-[-0.3px] transition-colors duration-fast ${
            value === o.value
              ? `font-bold ${accentText} ${accentBorder}`
              : "border-transparent font-normal text-muted hover:text-label"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
