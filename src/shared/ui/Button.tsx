import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "./Spinner";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 탭 액센트 배경 클래스 (예: "bg-tenant") — variant="primary"일 때 필수 */
  accentBg?: string;
  variant?: "primary" | "secondary";
  loading?: boolean;
};

export function Button({
  accentBg = "bg-primary",
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  children,
  ...rest
}: Props) {
  const base =
    "inline-flex h-11 items-center justify-center gap-2 rounded-[4px] px-6 text-[15px] font-bold tracking-[-0.3px] transition-colors duration-fast disabled:cursor-not-allowed";
  const style =
    variant === "primary"
      ? `${accentBg} text-white hover:opacity-90 disabled:bg-divider disabled:text-faint disabled:opacity-100`
      : "border border-hairline bg-surface text-label hover:bg-canvas disabled:text-faint";
  return (
    <button
      className={`${base} ${style} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
