export type TabKey = "overview" | "assess" | "monitor" | "policy" | "recovery";

export type TabMeta = {
  key: TabKey;
  path: string;
  /** 레일에 표시되는 업무 순서 — 실제 플로우 순서라서 의미가 있다 */
  step: string;
  title: string;
  description: string;
  /** 정적 클래스 매핑 — Tailwind purge 때문에 동적 조합 금지 */
  accent: {
    text: string;
    bg: string;
    softBg: string;
    border: string;
    focusRing: string;
    /** 레일 노드 점 색 */
    dot: string;
  };
};

export const TABS: TabMeta[] = [
  {
    key: "overview",
    path: "/",
    step: "LOOP",
    title: "플로우 개요",
    description: "심사부터 회수·환류까지 — 사고가 나도 끝나지 않는 리스크 루프 현황판.",
    accent: {
      text: "text-stage-data",
      bg: "bg-stage-data",
      softBg: "bg-stage-data-soft",
      border: "border-stage-data",
      focusRing: "focus:border-stage-data",
      dot: "bg-stage-data",
    },
  },
  {
    key: "assess",
    path: "/assess",
    step: "01",
    title: "심사·등급",
    description: "HUG 126%룰 게이트를 거쳐 모델1이 최초 위험 등급을 산정합니다.",
    accent: {
      text: "text-stage-assess",
      bg: "bg-stage-assess",
      softBg: "bg-stage-assess-soft",
      border: "border-stage-assess",
      focusRing: "focus:border-stage-assess",
      dot: "bg-stage-assess",
    },
  },
  {
    key: "monitor",
    path: "/monitor",
    step: "02",
    title: "상시 모니터링",
    description: "임대인 정보 변경을 추적해 재등급하고, 위험 상승 시 임차인에게 고지합니다.",
    accent: {
      text: "text-stage-monitor",
      bg: "bg-stage-monitor",
      softBg: "bg-stage-monitor-soft",
      border: "border-stage-monitor",
      focusRing: "focus:border-stage-monitor",
      dot: "bg-stage-monitor",
    },
  },
  {
    key: "policy",
    path: "/policy",
    step: "03",
    title: "정책 인사이트",
    description: "회수율 예측과 사고 예상 세그먼트를 파악해 인수기준·정책에 반영합니다.",
    accent: {
      text: "text-stage-policy",
      bg: "bg-stage-policy",
      softBg: "bg-stage-policy-soft",
      border: "border-stage-policy",
      focusRing: "focus:border-stage-policy",
      dot: "bg-stage-policy",
    },
  },
  {
    key: "recovery",
    path: "/recovery",
    step: "04",
    title: "회수 전략",
    description: "대위변제 발생 시 든든전세(자산화) vs 경매배당을 판정하고, 결과를 모델에 환류합니다.",
    accent: {
      text: "text-stage-safe",
      bg: "bg-stage-safe",
      softBg: "bg-stage-safe-soft",
      border: "border-stage-safe",
      focusRing: "focus:border-stage-safe",
      dot: "bg-stage-safe",
    },
  },
];

export const getTab = (key: TabKey): TabMeta => TABS.find((t) => t.key === key)!;
