import { useState } from "react";
import type { FormEvent } from "react";
import { HOUSE_TYPES, type TenantScoreReq, type HouseType } from "@/entities/assessment";
import { Button, Card, Field, Input, Select, Toggle } from "@/shared/ui";
import { comma, uncomma } from "@/shared/lib/format";
import { getTab } from "@/shared/config/tabs";
import { SIDO_LIST, SIGUNGU_MAP } from "@/shared/config/regions";
import { useRegionStore } from "@/shared/model/region";

const SENIOR_LIENS = ["없음", "근저당설정", "압류·가압류", "선순위존재", "미상"] as const;
const INSURANCES = ["가입", "미가입", "미상"] as const;

type Props = {
  loading: boolean;
  onSubmit: (req: TenantScoreReq) => void;
};

export function TenantForm({ loading, onSubmit }: Props) {
  const accent = getTab("tenant").accent;
  const { sido, sigungu, setSido, setSigungu } = useRegionStore();
  const [detailAddress, setDetailAddress] = useState("");
  const [houseType, setHouseType] = useState<HouseType | "">("");
  const [depositText, setDepositText] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [areaM2, setAreaM2] = useState("");
  const [seniorLien, setSeniorLien] = useState("");
  const [insurance, setInsurance] = useState("");
  const [hasLoan, setHasLoan] = useState(false);
  const [touched, setTouched] = useState(false);

  const deposit = uncomma(depositText);
  const valid =
    sido !== "" && sigungu !== "" && detailAddress.trim() !== "" && houseType !== "" && deposit > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onSubmit({
      address: `${sido} ${sigungu} ${detailAddress.trim()}`,
      houseType: houseType as HouseType,
      deposit,
      ...(areaM2 ? { areaM2: Number(areaM2) } : {}),
      ...(seniorLien ? { seniorLien: seniorLien as TenantScoreReq["seniorLien"] } : {}),
      ...(insurance ? { insurance: insurance as TenantScoreReq["insurance"] } : {}),
      hasLoan,
    });
  };

  return (
    <Card className="print-hidden p-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-5">
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
              placeholder="예: 화곡동 123-45 ○○빌라 302호"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
            />
            {touched && detailAddress.trim() === "" && (
              <span className="mt-1 block text-[12px] text-grade-danger">
                상세주소를 입력해주세요.
              </span>
            )}
          </Field>
          <Field label="주택유형" required>
            <Select
              focusRing={accent.focusRing}
              options={HOUSE_TYPES}
              placeholder="선택"
              value={houseType}
              onChange={(e) => setHouseType(e.target.value as HouseType)}
            />
            {touched && houseType === "" && (
              <span className="mt-1 block text-[12px] text-grade-danger">
                주택유형을 선택해주세요.
              </span>
            )}
          </Field>
          <Field label="전세보증금 (원)" required>
            <Input
              focusRing={accent.focusRing}
              inputMode="numeric"
              placeholder="예: 250,000,000"
              value={depositText}
              onChange={(e) => {
                const n = uncomma(e.target.value);
                setDepositText(n ? comma(n) : "");
              }}
            />
            {touched && !(deposit > 0) && (
              <span className="mt-1 block text-[12px] text-grade-danger">
                전세보증금을 입력해주세요.
              </span>
            )}
          </Field>
        </div>

        <button
          type="button"
          onClick={() => setShowDetail((v) => !v)}
          className="mt-5 flex items-center gap-1.5 text-[13px] font-bold text-label hover:text-ink"
        >
          <span
            className={`inline-block transition-transform duration-fast ${showDetail ? "rotate-90" : ""}`}
          >
            ›
          </span>
          상세 정보 입력 (선택)
        </button>

        {showDetail && (
          <div className="mt-4 grid grid-cols-2 gap-5 border-t border-divider pt-5">
            <Field label="전용면적 (㎡)">
              <Input
                focusRing={accent.focusRing}
                inputMode="decimal"
                placeholder="예: 59.8"
                value={areaM2}
                onChange={(e) => setAreaM2(e.target.value.replace(/[^\d.]/g, ""))}
              />
            </Field>
            <Field label="선순위권리">
              <Select
                focusRing={accent.focusRing}
                options={SENIOR_LIENS}
                placeholder="선택"
                value={seniorLien}
                onChange={(e) => setSeniorLien(e.target.value)}
              />
            </Field>
            <Field label="보증보험">
              <Select
                focusRing={accent.focusRing}
                options={INSURANCES}
                placeholder="선택"
                value={insurance}
                onChange={(e) => setInsurance(e.target.value)}
              />
            </Field>
            <div className="flex items-end pb-1.5">
              <div className="flex items-center gap-3">
                <Toggle checked={hasLoan} onChange={setHasLoan} accentBg={accent.bg} label="전세대출 이용예정" />
                <span className="text-[13px] font-bold text-label">전세대출 이용예정</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-divider pt-5">
          {!valid && touched && (
            <span className="text-[12px] text-muted">필수 항목을 모두 입력하면 검사할 수 있습니다.</span>
          )}
          <Button type="submit" accentBg={accent.bg} loading={loading} disabled={touched && !valid}>
            검사하기
          </Button>
        </div>
      </form>
    </Card>
  );
}
