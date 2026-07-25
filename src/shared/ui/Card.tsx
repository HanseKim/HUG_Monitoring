import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement>;

/** 플랫 흰 카드 — radius 10px, 1px divider 보더, 그림자 없음 */
export function Card({ className = "", ...rest }: Props) {
  return (
    <div
      className={`rounded-[10px] border border-divider bg-surface ${className}`}
      {...rest}
    />
  );
}
