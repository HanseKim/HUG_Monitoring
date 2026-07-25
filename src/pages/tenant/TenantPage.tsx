import { useTenantScore } from "@/entities/assessment";
import { TenantForm } from "@/features/tenant-form";
import { PageHeader } from "@/widgets/page-header";
import { GradeHero } from "@/widgets/grade-hero";
import { ChecklistCard } from "@/widgets/checklist-card";
import { SimilarCases } from "@/widgets/similar-cases";
import { InsuranceReco } from "@/widgets/insurance-reco";
import { RiskCurveChart } from "@/widgets/risk-curve-chart";
import { Card, ErrorState, Skeleton } from "@/shared/ui";

/** 결과 스켈레톤 — 최종 레이아웃과 동일 치수 */
function ResultSkeleton() {
  return (
    <div className="space-y-5">
      <Card className="flex items-center justify-between p-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-5 w-56" />
        </div>
        <Skeleton className="h-[150px] w-[260px]" />
      </Card>
      <Card className="space-y-3 p-6">
        <Skeleton className="h-5 w-40" />
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </Card>
      <div className="grid grid-cols-2 gap-5">
        <Card className="space-y-3 p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </Card>
        <Card className="space-y-3 p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-24 w-full" />
        </Card>
      </div>
      <Card className="space-y-3 p-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-[240px] w-full" />
      </Card>
    </div>
  );
}

export function TenantPage() {
  const mutation = useTenantScore();

  return (
    <div>
      <PageHeader tabKey="tenant" />
      <TenantForm loading={mutation.isPending} onSubmit={(req) => mutation.mutate(req)} />

      <div className="mt-6">
        {mutation.isPending && <ResultSkeleton />}
        {mutation.isError && (
          <ErrorState
            message={mutation.error.message}
            onRetry={() => mutation.variables && mutation.mutate(mutation.variables)}
          />
        )}
        {mutation.isSuccess && (
          <div className="animate-fade-in space-y-5">
            <GradeHero result={mutation.data} />
            <ChecklistCard items={mutation.data.checklist} />
            <div className="grid grid-cols-2 items-stretch gap-5">
              <SimilarCases cases={mutation.data.similarCases} />
              <InsuranceReco reco={mutation.data.insuranceReco} />
            </div>
            <RiskCurveChart result={mutation.data} />
          </div>
        )}
        {mutation.isIdle && (
          <p className="py-10 text-center text-[13px] text-muted">
            주소·주택유형·보증금을 입력하고 검사하기를 누르면 위험 진단 결과가 여기에 표시됩니다.
          </p>
        )}
      </div>
    </div>
  );
}
