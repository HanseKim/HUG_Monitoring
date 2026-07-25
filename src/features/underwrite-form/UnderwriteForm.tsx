import { useState } from "react";
import type { FormEvent } from "react";
import type { UnderwriteReq } from "@/entities/assessment";
import { HOUSE_TYPES } from "@/entities/assessment";
import { Button, Card, Field, Input, Select } from "@/shared/ui";
import { comma, uncomma } from "@/shared/lib/format";
import { getTab } from "@/shared/config/tabs";
import { SIDO_LIST, SIGUNGU_MAP } from "@/shared/config/regions";
import { useRegionStore } from "@/shared/model/region";

const genId = () =>
  `A-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;

type Props = {
  loading: boolean;
  onSubmit: (req: UnderwriteReq) => void;
  /** 데모 프리필 — 진입 즉시 결과가 보이도록 목 입력값을 채워둔다 */
  initial?: UnderwriteReq;
};

export function UnderwriteForm({ loading, onSubmit, initial }: Props) {
  const accent = getTab("assess").accent;
  const [applicationId, setApplicationId] = useState(initial?.applicationId ?? genId());
  const { sido, sigungu, setSido, setSigungu } = useRegionStore();
  const [houseType, setHouseType] = useState(initial?.houseType ?? "");
  const [areaM2, setAreaM2] = useState(initial ? String(initial.areaM2) : "");
  const [deposit, setDeposit] = useState(initial ? comma(initial.deposit) : "");
  const [housePrice, setHousePrice] = useState(initial ? comma(initial.housePrice) : "");
  const [seniorAmount, setSeniorAmount] = useState(
    initial && initial.seniorAmount > 0 ? comma(initial.seniorAmount) : "",
  );
  const [appliedAt, setAppliedAt] = useState(
    initial?.appliedAt ?? new Date().toISOString().slice(0, 10),
  );
  const [touched, setTouched] = useState(false);

  const valid =
    sido !== "" &&
    sigungu.trim() !== "" &&
    houseType !== "" &&
    Number(areaM2) > 0 &&
    uncomma(deposit) > 0 &&
    uncomma(housePrice) > 0 &&
    appliedAt !== "";

  const moneyInput = (value: string, set: (v: string) => void, placeholder: string) => (
    <Input
      focusRing={accent.focusRing}
      inputMode="numeric"
      placeholder={placeholder}
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
      applicationId,
      sido,
      sigungu: sigungu.trim(),
      houseType,
      areaM2: Number(areaM2),
      deposit: uncomma(deposit),
      housePrice: uncomma(housePrice),
      seniorAmount: uncomma(seniorAmount) || 0,
      appliedAt,
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-5">
          <Field label="신청ID" hint="자동생성 — 수정 가능">
            <Input
              focusRing={accent.focusRing}
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
            />
          </Field>
          <Field label="시도" required hint="사이드바의 기준 지역과 연동됩니다">
            <Select
              focusRing={accent.focusRing}
              options={SIDO_LIST}
              value={sido}
              onChange={(e) => setSido(e.target.value)}
            />
          </Field>
          <Field label="시군구" required>
            <Select
              focusRing={accent.focusRing}
              options={SIGUNGU_MAP[sido] ?? []}
              value={sigungu}
              onChange={(e) => setSigungu(e.target.value)}
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
              placeholder="예: 59.8"
              value={areaM2}
              onChange={(e) => setAreaM2(e.target.value.replace(/[^\d.]/g, ""))}
            />
          </Field>
          <Field label="신청시점" required>
            <Input
              focusRing={accent.focusRing}
              type="date"
              value={appliedAt}
              onChange={(e) => setAppliedAt(e.target.value)}
            />
          </Field>
          <Field label="신청보증금 (원)" required>
            {moneyInput(deposit, setDeposit, "예: 250,000,000")}
          </Field>
          <Field label="주택가액 (원)" required>
            {moneyInput(housePrice, setHousePrice, "예: 300,000,000")}
          </Field>
          <Field label="선순위금액 (원)">
            {moneyInput(seniorAmount, setSeniorAmount, "없으면 비워두세요")}
          </Field>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-divider pt-5">
          {touched && !valid && (
            <span className="text-[12px] text-muted">필수 항목을 모두 입력하면 심사할 수 있습니다.</span>
          )}
          <Button type="submit" accentBg={accent.bg} loading={loading}>
            심사하기
          </Button>
        </div>
      </form>
    </Card>
  );
}
