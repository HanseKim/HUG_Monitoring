/** 플랫 펄스 스켈레톤 — divider색, 쉬머 없음 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-flat-pulse rounded bg-divider ${className}`} />
  );
}
