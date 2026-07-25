import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { analyzeRecovery, useRecoveryAnalyze } from "@/entities/recovery-case";
import type { RecoveryPath, RecoveryReq, RecoveryRes } from "@/entities/recovery-case";
import { RecoveryForm } from "@/features/recovery-form";
import { CsvUpload, type CsvRow } from "@/features/csv-upload";
import { PageHeader } from "@/widgets/page-header";
import { RecoveryReport } from "@/widgets/recovery-report";
import { Card, ErrorState, Segmented, Skeleton, Table, Th, Td } from "@/shared/ui";
import { getTab } from "@/shared/config/tabs";
import { formatKRWShort } from "@/shared/lib/format";

const CSV_COLUMNS = [
  "address",
  "houseType",
  "areaM2",
  "subrogationAmount",
  "seniorAmount",
  "appraisalPrice",
  "minBidPrice",
  "failedBidCount",
] as const;

const PATH_COLORS: Record<RecoveryPath, string> = {
  셀프낙찰: "#0B3B7A",
  배당대기: "#5EA8E5",
  협의매입: "#16A34A",
  캠코공매: "#F59E0B",
  재산추적: "#DC2626",
};

type BatchItem = { req: RecoveryReq; res: RecoveryRes | null; error?: string };

const rowToReq = (row: CsvRow): RecoveryReq => ({
  caseNo: row.caseNo || undefined,
  address: row.address,
  houseType: row.houseType,
  areaM2: Number(row.areaM2),
  subrogationAmount: Number(row.subrogationAmount),
  seniorAmount: Number(row.seniorAmount) || 0,
  appraisalPrice: Number(row.appraisalPrice),
  minBidPrice: Number(row.minBidPrice),
  failedBidCount: Number(row.failedBidCount) || 0,
});

const today = () => new Date().toISOString().slice(0, 10);

function ReportSkeleton() {
  return (
    <Card className="space-y-6 p-10">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-16 w-80" />
      <Skeleton className="h-[120px] w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-40 w-full" />
    </Card>
  );
}

export function RecoveryPage() {
  const accent = getTab("recovery").accent;
  const [mode, setMode] = useState<"single" | "csv">("single");
  const single = useRecoveryAnalyze();
  const [singleReq, setSingleReq] = useState<RecoveryReq | null>(null);

  const [batch, setBatch] = useState<BatchItem[] | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [selected, setSelected] = useState<BatchItem | null>(null);

  const runBatch = async (rows: CsvRow[]) => {
    setBatchLoading(true);
    setBatch(null);
    setSelected(null);
    const reqs = rows.map(rowToReq);
    const results = await Promise.allSettled(reqs.map((r) => analyzeRecovery(r)));
    setBatch(
      results.map((r, i) =>
        r.status === "fulfilled"
          ? { req: reqs[i], res: r.value }
          : { req: reqs[i], res: null, error: (r.reason as Error).message },
      ),
    );
    setBatchLoading(false);
  };

  const pathDist = (batch ?? [])
    .filter((b) => b.res)
    .reduce<Record<string, number>>((acc, b) => {
      acc[b.res!.path] = (acc[b.res!.path] ?? 0) + 1;
      return acc;
    }, {});
  const pieData = Object.entries(pathDist).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageHeader tabKey="recovery" />

      <div className="print-hidden mb-5">
        <Segmented
          options={[
            { value: "single", label: "직접 입력" },
            { value: "csv", label: "CSV 업로드" },
          ]}
          value={mode}
          onChange={setMode}
          accentText={accent.text}
        />
      </div>

      {mode === "single" ? (
        <>
          <RecoveryForm
            loading={single.isPending}
            onSubmit={(req) => {
              setSingleReq(req);
              single.mutate(req);
            }}
          />
          <div className="mt-6">
            {single.isPending && <ReportSkeleton />}
            {single.isError && (
              <ErrorState
                message={single.error.message}
                onRetry={() => single.variables && single.mutate(single.variables)}
              />
            )}
            {single.isSuccess && singleReq && (
              <div className="animate-fade-in">
                <RecoveryReport req={singleReq} res={single.data} judgedAt={today()} />
              </div>
            )}
            {single.isIdle && (
              <p className="py-10 text-center text-[13px] text-muted">
                사건 정보를 입력하고 판정하기를 누르면 사후처리 판정 레포트가 여기에 표시됩니다.
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="print-hidden">
            <CsvUpload
              requiredColumns={CSV_COLUMNS}
              actionLabel={(n) => `${n}건 일괄 판정`}
              accentBg={accent.bg}
              loading={batchLoading}
              onSubmit={runBatch}
            />
          </div>

          <div className="mt-6 space-y-5">
            {batchLoading && <ReportSkeleton />}
            {batch && (
              <div className="print-hidden animate-fade-in grid grid-cols-[320px_1fr] gap-5">
                <Card className="p-5">
                  <h4 className="mb-2 text-[14px] font-bold text-ink">경로별 분포</h4>
                  <div className="h-[200px]">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                        >
                          {pieData.map((d) => (
                            <Cell key={d.name} fill={PATH_COLORS[d.name as RecoveryPath]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v, n) => [`${v}건`, String(n)]}
                          contentStyle={{
                            border: "1px solid #dee3e8",
                            borderRadius: 8,
                            fontSize: 12,
                            boxShadow: "none",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {pieData.map((d) => (
                      <li key={d.name} className="flex items-center gap-2 text-[12px] text-body">
                        <span
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ background: PATH_COLORS[d.name as RecoveryPath] }}
                        />
                        {d.name} — {d.value}건
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card className="p-4">
                  <Table>
                    <thead>
                      <tr>
                        <Th>주소</Th>
                        <Th>유형</Th>
                        <Th className="text-right">대위변제액</Th>
                        <Th className="text-right">경제이득</Th>
                        <Th>판정 경로</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {batch.map((b, i) => (
                        <tr
                          key={i}
                          onClick={() => b.res && setSelected(b)}
                          className={b.res ? "cursor-pointer hover:bg-canvas" : ""}
                        >
                          <Td>{b.req.address}</Td>
                          <Td>{b.req.houseType}</Td>
                          <Td className="text-right tabular-nums">
                            {formatKRWShort(b.req.subrogationAmount)}
                          </Td>
                          <Td className="text-right tabular-nums">
                            {b.res ? formatKRWShort(b.res.economicGain) : "-"}
                          </Td>
                          <Td>
                            {b.res ? (
                              <span
                                className="rounded-md px-2 py-0.5 text-[12px] font-bold text-white"
                                style={{ background: PATH_COLORS[b.res.path] }}
                              >
                                {b.res.path}
                              </span>
                            ) : (
                              <span className="text-[12px] text-grade-danger">
                                실패 — {b.error}
                              </span>
                            )}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <p className="mt-2 text-right text-[12px] text-muted">
                    행을 클릭하면 아래에 단건 레포트가 표시됩니다.
                  </p>
                </Card>
              </div>
            )}
            {selected?.res && (
              <div className="animate-fade-in">
                <RecoveryReport req={selected.req} res={selected.res} judgedAt={today()} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
