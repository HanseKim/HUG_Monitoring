import { useRegionStore } from "@/shared/model/region";
import { SIDO_LIST, SIGUNGU_MAP } from "@/shared/config/regions";

/** 사이드바용 컴팩트 지역 선택 */
export function RegionSelect() {
  const { sido, sigungu, setSido, setSigungu } = useRegionStore();
  const sigunguList = SIGUNGU_MAP[sido] ?? [];

  const cls =
    "h-9 w-full rounded-[3px] border border-hairline bg-surface px-2.5 text-[13px] text-ink outline-none focus:border-label";

  return (
    <div className="px-6 py-4">
      <p className="mb-2 text-[11px] font-bold tracking-wide text-muted">기준 지역</p>
      <div className="space-y-2">
        <select className={cls} value={sido} onChange={(e) => setSido(e.target.value)}>
          {SIDO_LIST.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select className={cls} value={sigungu} onChange={(e) => setSigungu(e.target.value)}>
          {sigunguList.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-faint">
        각 탭 입력폼의 기본 지역으로 적용됩니다.
      </p>
    </div>
  );
}
