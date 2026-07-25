import type { ChecklistItem } from "@/entities/assessment";
import { Card } from "@/shared/ui";

export function ChecklistCard({ items }: { items: ChecklistItem[] }) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-[16px] font-bold text-ink">위험 신호 체크리스트</h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li
            key={item.id}
            className={`rounded-lg px-4 py-3 ${
              item.fired ? "bg-grade-danger-soft" : "border border-divider"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span
                className={`mt-0.5 text-[14px] ${item.fired ? "text-grade-danger" : "text-grade-safe"}`}
                aria-hidden
              >
                {item.fired ? "⚠" : "✓"}
              </span>
              <div>
                <p
                  className={`text-[14px] font-bold ${item.fired ? "text-grade-danger" : "text-label"}`}
                >
                  <span className="mr-1.5 text-[12px] font-normal text-muted">{item.id}</span>
                  {item.title}
                </p>
                <p className={`mt-0.5 text-[13px] ${item.fired ? "text-body" : "text-muted"}`}>
                  {item.evidence}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
