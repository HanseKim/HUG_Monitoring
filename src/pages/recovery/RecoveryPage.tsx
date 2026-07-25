import { useEffect, useRef, useState } from "react";
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

/** 환류 — 회수 판정 결과가 심사 모델 학습 데이터로 축적됨을 표시 */
function FeedbackLoopBanner() {
  return (
    <div className="print-hidden flex items-center gap-3 rounded-xl border border-stage-data/40 bg-stage-data-soft px-5 py-3.5">
      <span className="num text-[13px] text-stage-data">↻</span>
      <p className="text-[13px] text-body">
        이 판정과 실제 회수 결과(회수율·소요기간)는{" "}
        <b className="text-ink">최초 심사 모델(모델1)의 학습 데이터로 환류</b>되어 등급 엔진을
        고도화합니다. <span className="text-muted">누적 축적 1,284건 (데모용 목데이터)</span>
      </p>
    </div>
  );
}

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

// 데모 프리필 — 세종 합성 목데이터. 셀프낙찰 게이트 3개 통과 케이스
const DEMO_DETAIL = "한솔동 12-3 ○○빌라 302호";
const DEMO_REQ: RecoveryReq = {
  caseNo: "2026타경10001",
  address: `세종 세종시 ${DEMO_DETAIL}`,
  houseType: "다세대주택",
  areaM2: 45.2,
  subrogationAmount: 280_000_000,
  seniorAmount: 0,
  appraisalPrice: 320_000_000,
  minBidPrice: 224_000_000,
  failedBidCount: 1,
  evictionStatus: "양호",
  defectStatus: "양호",
  opposableTenant: "무",
};

export function RecoveryPage() {
  const accent = getTab("recovery").accent;
  const [mode, setMode] = useState<"single" | "csv">("single");
  const single = useRecoveryAnalyze();
  const [singleReq, setSingleReq] = useState<RecoveryReq | null>(null);

  // 진입 시 데모 레포트 자동 표시 — 입력을 바꿔 판정하면 실제(목) API로 재계산.
  // 부팅 직후 fetch는 MSW 워커 활성화 레이스로 응답이 유실될 수 있어 짧게 지연.
  const demoFired = useRef(false);
  useEffect(() => {
    const t = setTimeout(() => {
      if (demoFired.current) return;
      demoFired.current = true;
      setSingleReq(DEMO_REQ);
      single.mutate(DEMO_REQ);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      {/* 채권회수 전략 수립 — 위험물건 × 현금보유현황으로 회수 방향을 사전 설계 */}
      <div className="print-hidden mb-5 grid grid-cols-3 gap-5">
        <Card className="p-5">
          <p className="caption">가용 매입 재원 (분기)</p>
          <p className="num mt-1.5 text-[24px] text-ink">312억원</p>
          <p className="mt-1 text-[12px] text-muted">셀프낙찰 투입 가능 한도 · 목데이터</p>
        </Card>
        <Card className="p-5">
          <p className="caption">셀프낙찰 여력</p>
          <p className="num mt-1.5 text-[24px] text-ink">약 14건</p>
          <p className="mt-1 text-[12px] text-muted">평균 낙찰가 기준 환산 · 목데이터</p>
        </Card>
        <Card className="p-5">
          <p className="caption">회수 전략 대기 물건</p>
          <p className="num mt-1.5 text-[24px] text-grade-danger">6건</p>
          <p className="mt-1 text-[12px] text-muted">모니터링 위험 분류분 — 사전 설계 대상</p>
        </Card>
      </div>

      <div className="print-hidden mb-5">
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
          <RecoveryForm
            initial={{ ...DEMO_REQ, detailAddress: DEMO_DETAIL }}
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
              <div className="animate-fade-in space-y-4">
                <RecoveryReport req={singleReq} res={single.data} judgedAt={today()} />
                <FeedbackLoopBanner />
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
              <div className="animate-fade-in space-y-4">
                <RecoveryReport req={selected.req} res={selected.res} judgedAt={today()} />
                <FeedbackLoopBanner />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
