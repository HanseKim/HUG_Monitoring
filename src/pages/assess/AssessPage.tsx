import { useState } from "react";
import { scoreUnderwrite, useUnderwriteScore } from "@/entities/assessment";
import type { UnderwriteReq } from "@/entities/assessment";
import { UnderwriteForm } from "@/features/underwrite-form";
import { CsvUpload, type CsvRow } from "@/features/csv-upload";
import { PageHeader } from "@/widgets/page-header";
import { VerdictHero } from "@/widgets/verdict-hero";
import { StatTiles } from "@/widgets/stat-tiles";
import { BatchSummary, BatchTable, type BatchRow } from "@/widgets/batch-table";
import { Card, ErrorState, Segmented, Skeleton, SlideOver } from "@/shared/ui";
import { getTab } from "@/shared/config/tabs";

const CSV_COLUMNS = [
  "sido",
  "sigungu",
  "houseType",
  "areaM2",
  "deposit",
  "housePrice",
  "seniorAmount",
  "appliedAt",
] as const;

const rowToReq = (row: CsvRow): UnderwriteReq => ({
  applicationId: row.applicationId || undefined,
  sido: row.sido,
  sigungu: row.sigungu,
  houseType: row.houseType,
  areaM2: Number(row.areaM2),
  deposit: Number(row.deposit),
  housePrice: Number(row.housePrice),
  seniorAmount: Number(row.seniorAmount) || 0,
  appliedAt: row.appliedAt,
});

function SingleSkeleton() {
  return (
    <div className="space-y-5">
      <Card className="space-y-4 p-8">
        <Skeleton className="h-14 w-40" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </Card>
      <div className="grid grid-cols-4 gap-5">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="space-y-3 p-5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-28" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AssessPage() {
  const accent = getTab("assess").accent;
  const [mode, setMode] = useState<"single" | "csv">("single");
  const single = useUnderwriteScore();

  const [batchRows, setBatchRows] = useState<BatchRow[] | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [selected, setSelected] = useState<BatchRow | null>(null);

  const runBatch = async (rows: CsvRow[]) => {
    setBatchLoading(true);
    setBatchRows(null);
    const reqs = rows.map(rowToReq);
    // 건별 API 호출 (스펙 §1) — 실패 건은 행 단위로 표시
    const results = await Promise.allSettled(reqs.map((req) => scoreUnderwrite(req)));
    setBatchRows(
      results.map((r, i) =>
        r.status === "fulfilled"
          ? { req: reqs[i], res: r.value }
          : { req: reqs[i], res: null, error: (r.reason as Error).message },
      ),
    );
    setBatchLoading(false);
  };

  return (
    <div>
      <PageHeader tabKey="assess" />

      <div className="mb-5">
        <Segmented
          options={[
            { value: "single", label: "직접 입력" },
            { value: "csv", label: "CSV 업로드" },
          ]}
          value={mode}
          onChange={setMode}
          accentText={accent.text}
          accentBorder={accent.border}
        />
      </div>

      {mode === "single" ? (
        <>
          <UnderwriteForm loading={single.isPending} onSubmit={(req) => single.mutate(req)} />
          <div className="mt-6">
            {single.isPending && <SingleSkeleton />}
            {single.isError && (
              <ErrorState
                message={single.error.message}
                onRetry={() => single.variables && single.mutate(single.variables)}
              />
            )}
            {single.isSuccess && (
              <div className="animate-fade-in space-y-5">
                <VerdictHero result={single.data} />
                <StatTiles result={single.data} />
              </div>
            )}
            {single.isIdle && (
              <p className="py-10 text-center text-[13px] text-muted">
                신청 정보를 입력하고 심사하기를 누르면 판정 결과가 여기에 표시됩니다.
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <CsvUpload
            requiredColumns={CSV_COLUMNS}
            actionLabel={(n) => `${n}건 일괄 심사`}
            accentBg={accent.bg}
            loading={batchLoading}
            onSubmit={runBatch}
          />
          <div className="mt-6">
            {batchLoading && (
              <div className="space-y-5">
                <div className="grid grid-cols-4 gap-5">
                  {[0, 1, 2, 3].map((i) => (
                    <Card key={i} className="space-y-3 p-5">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-9 w-24" />
                    </Card>
                  ))}
                </div>
                <Card className="space-y-2 p-4">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                  ))}
                </Card>
              </div>
            )}
            {batchRows && (
              <div className="animate-fade-in space-y-5">
                <BatchSummary rows={batchRows} />
                <BatchTable rows={batchRows} onSelect={setSelected} />
              </div>
            )}
          </div>
          <SlideOver
            open={selected !== null}
            onClose={() => setSelected(null)}
            title={`심사 상세 — ${selected?.req.applicationId ?? ""}`}
          >
            {selected?.res && (
              <div className="space-y-5">
                <VerdictHero result={selected.res} />
                <div className="[&>div]:grid-cols-2">
                  <StatTiles result={selected.res} />
                </div>
              </div>
            )}
          </SlideOver>
        </>
      )}
    </div>
  );
}
