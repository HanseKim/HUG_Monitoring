type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  /** 켜짐 상태 배경 클래스 (예: "bg-tenant") */
  accentBg?: string;
  label?: string;
};

export function Toggle({ checked, onChange, accentBg = "bg-primary", label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors duration-std ${
        checked ? accentBg : "bg-hairline"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-std ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
