import { useRegionStore } from "@/shared/model/region";
import { SIDO_LIST, SIGUNGU_MAP } from "@/shared/config/regions";

/** 관제 레일용 지역 선택 (다크) */
export function RegionSelect() {
  const { sido, sigungu, setSido, setSigungu } = useRegionStore();
  const sigunguList = SIGUNGU_MAP[sido] ?? [];

  const cls =
    "h-9 w-full rounded-md border border-rail-line bg-rail-soft px-2.5 text-[12.5px] text-white outline-none focus:border-hug";

  return (
    <div className="px-5 py-4">
      <p className="caption mb-2 !text-rail-text/70">기준 지역</p>
      <div className="grid grid-cols-2 gap-2">
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
      <p className="mt-2 text-[10.5px] leading-relaxed text-rail-text/60">
        각 단계 입력폼의 기본 지역으로 적용됩니다.
      </p>
    </div>
  );
}
