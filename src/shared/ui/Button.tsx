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
    "inline-flex h-12 items-center justify-center gap-2 rounded-lg px-6 text-[16px] font-bold transition-colors duration-fast disabled:cursor-not-allowed";
  const style =
    variant === "primary"
      ? `${accentBg} text-white disabled:bg-divider disabled:text-faint`
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
