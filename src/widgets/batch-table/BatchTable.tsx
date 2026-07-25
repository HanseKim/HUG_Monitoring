import type { UnderwriteReq, UnderwriteRes } from "@/entities/assessment";
import { Card, Table, Th, Td } from "@/shared/ui";
import { formatKRWShort, formatPct } from "@/shared/lib/format";

export type BatchRow = {
  req: UnderwriteReq;
  res: UnderwriteRes | null; // null = 해당 건 API 실패
  error?: string;
};

type Props = {
  rows: BatchRow[];
  onSelect: (row: BatchRow) => void;
};

export function BatchSummary({ rows }: { rows: BatchRow[] }) {
  const done = rows.filter((r) => r.res);
  const approved = done.filter((r) => r.res!.verdict === "승인").length;
  const rejected = done.filter((r) => r.res!.verdict === "거절").length;
  const elSum = done.reduce((s, r) => s + r.res!.el, 0);
  const items = [
    { label: "총 심사", value: `${rows.length}건` },
    { label: "승인", value: `${approved}건`, cls: "text-grade-safe" },
    { label: "거절", value: `${rejected}건`, cls: "text-grade-danger" },
    { label: "예상 EL 합계", value: formatKRWShort(elSum) },
  ];
  return (
    <div className="grid grid-cols-4 gap-5">
      {items.map((it) => (
        <Card key={it.label} className="p-5">
          <p className="text-[12px] font-bold text-muted">{it.label}</p>
          <p className={`mt-1.5 text-[28px] font-normal tracking-tight tabular-nums ${it.cls ?? "text-slate"}`}>
            {it.value}
          </p>
        </Card>
      ))}
    </div>
  );
}

export function BatchTable({ rows, onSelect }: Props) {
  return (
    <Card className="p-4">
      <Table>
        <thead>
          <tr>
            <Th>신청ID</Th>
            <Th>지역</Th>
            <Th>유형</Th>
            <Th className="text-right">보증금</Th>
            <Th className="text-right">전세가율</Th>
            <Th className="text-right">EL</Th>
            <Th>판정</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={() => row.res && onSelect(row)}
              className={row.res ? "cursor-pointer hover:bg-canvas" : ""}
            >
              <Td>{row.req.applicationId ?? "-"}</Td>
              <Td>
                {row.req.sido} {row.req.sigungu}
              </Td>
              <Td>{row.req.houseType}</Td>
              <Td className="text-right tabular-nums">{formatKRWShort(row.req.deposit)}</Td>
              <Td className="text-right tabular-nums">
                {row.res ? formatPct(row.res.jeonseRatio) : "-"}
              </Td>
              <Td className="text-right tabular-nums">
                {row.res ? formatKRWShort(row.res.el) : "-"}
              </Td>
              <Td>
                {row.res ? (
                  <span
                    className={`rounded-md px-2 py-0.5 text-[12px] font-bold ${
                      row.res.verdict === "승인"
                        ? "bg-grade-safe-soft text-grade-safe"
                        : "bg-grade-danger-soft text-grade-danger"
                    }`}
                  >
                    {row.res.verdict}
                  </span>
                ) : (
                  <span className="text-[12px] text-grade-danger">실패 — {row.error}</span>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
