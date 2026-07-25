import { useState } from "react";
import type { FormEvent } from "react";
import type { RecoveryReq } from "@/entities/recovery-case";
import { HOUSE_TYPES } from "@/entities/assessment";
import { Button, Card, Field, Input, Select } from "@/shared/ui";
import { comma, uncomma } from "@/shared/lib/format";
import { getTab } from "@/shared/config/tabs";
import { SIDO_LIST, SIGUNGU_MAP } from "@/shared/config/regions";
import { useRegionStore } from "@/shared/model/region";

const EVICTION = ["양호", "점유중", "미상"] as const;
const DEFECT = ["양호", "경미", "보수필요", "미상"] as const;
const OPPOSABLE = ["유", "무", "미상"] as const;

type Props = {
  loading: boolean;
  onSubmit: (req: RecoveryReq) => void;
  /** 데모 프리필 — 진입 즉시 결과가 보이도록 목 입력값을 채워둔다 */
  initial?: RecoveryReq & { detailAddress?: string };
};

export function RecoveryForm({ loading, onSubmit, initial }: Props) {
  const accent = getTab("recovery").accent;
  const [caseNo, setCaseNo] = useState(initial?.caseNo ?? "");
  const { sido, sigungu, setSido, setSigungu } = useRegionStore();
  const [detailAddress, setDetailAddress] = useState(initial?.detailAddress ?? "");
  const [houseType, setHouseType] = useState(initial?.houseType ?? "");
  const [areaM2, setAreaM2] = useState(initial ? String(initial.areaM2) : "");
  const [subrogationAmount, setSubrogationAmount] = useState(
    initial ? comma(initial.subrogationAmount) : "",
  );
  const [seniorAmount, setSeniorAmount] = useState(
    initial && initial.seniorAmount > 0 ? comma(initial.seniorAmount) : "",
  );
  const [appraisalPrice, setAppraisalPrice] = useState(
    initial ? comma(initial.appraisalPrice) : "",
  );
  const [minBidPrice, setMinBidPrice] = useState(initial ? comma(initial.minBidPrice) : "");
  const [failedBidCount, setFailedBidCount] = useState(
    initial ? String(initial.failedBidCount) : "0",
  );
  const [evictionStatus, setEvictionStatus] = useState(initial?.evictionStatus ?? "");
  const [defectStatus, setDefectStatus] = useState(initial?.defectStatus ?? "");
  const [opposableTenant, setOpposableTenant] = useState(initial?.opposableTenant ?? "");
  const [touched, setTouched] = useState(false);

  const valid =
    detailAddress.trim() !== "" &&
    houseType !== "" &&
    Number(areaM2) > 0 &&
    uncomma(subrogationAmount) > 0 &&
    uncomma(appraisalPrice) > 0 &&
    uncomma(minBidPrice) > 0;

  const money = (value: string, set: (v: string) => void, ph: string) => (
    <Input
      focusRing={accent.focusRing}
      inputMode="numeric"
      placeholder={ph}
      value={value}
      onChange={(e) => {
        const n = uncomma(e.target.value);
        set(n ? comma(n) : "");
      }}
    />
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onSubmit({
      caseNo: caseNo.trim() || undefined,
      address: `${sido} ${sigungu} ${detailAddress.trim()}`,
      houseType,
      areaM2: Number(areaM2),
      subrogationAmount: uncomma(subrogationAmount),
      seniorAmount: uncomma(seniorAmount) || 0,
      appraisalPrice: uncomma(appraisalPrice),
      minBidPrice: uncomma(minBidPrice),
      failedBidCount: Number(failedBidCount) || 0,
      ...(evictionStatus ? { evictionStatus: evictionStatus as RecoveryReq["evictionStatus"] } : {}),
      ...(defectStatus ? { defectStatus: defectStatus as RecoveryReq["defectStatus"] } : {}),
      ...(opposableTenant
        ? { opposableTenant: opposableTenant as RecoveryReq["opposableTenant"] }
        : {}),
    });
  };

  return (
    <Card className="print-hidden p-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-5">
          <Field label="사건번호">
            <Input
              focusRing={accent.focusRing}
              placeholder="예: 2026타경12345"
              value={caseNo}
              onChange={(e) => setCaseNo(e.target.value)}
            />
          </Field>
          <Field label="지역" required hint="사이드바의 기준 지역과 연동됩니다">
            <div className="grid grid-cols-2 gap-2">
              <Select
                focusRing={accent.focusRing}
                options={SIDO_LIST}
                value={sido}
                onChange={(e) => setSido(e.target.value)}
              />
              <Select
                focusRing={accent.focusRing}
                options={SIGUNGU_MAP[sido] ?? []}
                value={sigungu}
                onChange={(e) => setSigungu(e.target.value)}
              />
            </div>
          </Field>
          <Field label="상세주소" required>
            <Input
              focusRing={accent.focusRing}
              placeholder="예: 주안동 12-3 △△오피스텔 1204호"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
            />
          </Field>
          <Field label="주택유형" required>
            <Select
              focusRing={accent.focusRing}
              options={HOUSE_TYPES}
              placeholder="선택"
              value={houseType}
              onChange={(e) => setHouseType(e.target.value)}
            />
          </Field>
          <Field label="전용면적 (㎡)" required>
            <Input
              focusRing={accent.focusRing}
              inputMode="decimal"
              placeholder="예: 42.1"
              value={areaM2}
              onChange={(e) => setAreaM2(e.target.value.replace(/[^\d.]/g, ""))}
            />
          </Field>
          <Field label="대위변제액 (원)" required>
            {money(subrogationAmount, setSubrogationAmount, "예: 180,000,000")}
          </Field>
          <Field label="선순위금액 (원)">
            {money(seniorAmount, setSeniorAmount, "없으면 비워두세요")}
          </Field>
          <Field label="감정가 (원)" required>
            {money(appraisalPrice, setAppraisalPrice, "예: 220,000,000")}
          </Field>
          <Field label="최저매각가 (원)" required>
            {money(minBidPrice, setMinBidPrice, "예: 154,000,000")}
          </Field>
          <Field label="유찰횟수">
            <Input
              focusRing={accent.focusRing}
              inputMode="numeric"
              value={failedBidCount}
              onChange={(e) => setFailedBidCount(e.target.value.replace(/[^\d]/g, ""))}
            />
          </Field>
          <Field label="명도상태">
            <Select
              focusRing={accent.focusRing}
              options={EVICTION}
              placeholder="선택"
              value={evictionStatus}
              onChange={(e) => setEvictionStatus(e.target.value)}
            />
          </Field>
          <Field label="하자상태">
            <Select
              focusRing={accent.focusRing}
              options={DEFECT}
              placeholder="선택"
              value={defectStatus}
              onChange={(e) => setDefectStatus(e.target.value)}
            />
          </Field>
          <Field label="대항력임차인">
            <Select
              focusRing={accent.focusRing}
              options={OPPOSABLE}
              placeholder="선택"
              value={opposableTenant}
              onChange={(e) => setOpposableTenant(e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-divider pt-5">
          {touched && !valid && (
            <span className="text-[12px] text-muted">필수 항목을 모두 입력하면 판정할 수 있습니다.</span>
          )}
          <Button type="submit" accentBg={accent.bg} loading={loading}>
            판정하기
          </Button>
        </div>
      </form>
    </Card>
  );
}
