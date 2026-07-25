import { Card } from "./Card";
import { Button } from "./Button";

/** 에러 상태 — 원인 + 해결 행동 명시, 재시도 버튼 */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="flex flex-col items-center gap-4 p-10 text-center">
      <p className="text-[14px] font-bold text-ink">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="h-10 px-5 text-[14px]" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </Card>
  );
}

/** 빈 상태 — 왜 비어있는지 한 줄 설명 */
export function EmptyState({ message }: { message: string }) {
  return (
    <Card className="p-10 text-center">
      <p className="text-[14px] text-muted">{message}</p>
    </Card>
  );
}
