import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-label">
        {label}
        {required && <span className="ml-0.5 text-grade-danger">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-muted">{hint}</span>}
    </label>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** 탭 액센트 포커스 클래스 (예: "focus:border-tenant") */
  focusRing?: string;
};

export function Input({ focusRing = "focus:border-primary", className = "", ...rest }: InputProps) {
  return (
    <input
      className={`h-11 w-full rounded-[3px] border border-hairline bg-surface px-3.5 text-[14px] text-ink outline-none transition-colors duration-fast placeholder:text-faint ${focusRing} ${className}`}
      {...rest}
    />
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  focusRing?: string;
  options: readonly string[];
  placeholder?: string;
};

export function Select({
  focusRing = "focus:border-primary",
  options,
  placeholder,
  className = "",
  ...rest
}: SelectProps) {
  return (
    <select
      className={`h-11 w-full rounded-[3px] border border-hairline bg-surface px-3 text-[14px] text-ink outline-none transition-colors duration-fast ${focusRing} ${className}`}
      {...rest}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
