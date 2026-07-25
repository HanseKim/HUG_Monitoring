import { create } from "zustand";
import { SIGUNGU_MAP } from "@/shared/config/regions";

type RegionState = {
  sido: string;
  sigungu: string;
  setSido: (sido: string) => void;
  setSigungu: (sigungu: string) => void;
};

/** 전역 지역 선택 — 사이드바에서 고르면 각 탭 입력폼의 기본값이 된다 */
// 발제사 제공 데이터가 세종시뿐이라 데모 기본 지역은 세종 (나머지는 합성 목데이터)
export const useRegionStore = create<RegionState>((set) => ({
  sido: "세종",
  sigungu: "세종시",
  setSido: (sido) => set({ sido, sigungu: SIGUNGU_MAP[sido]?.[0] ?? "" }),
  setSigungu: (sigungu) => set({ sigungu }),
}));
