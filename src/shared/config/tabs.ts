export type TabKey = "tenant" | "underwrite" | "monitor" | "recovery";

export type TabMeta = {
  key: TabKey;
  path: string;
  title: string;
  description: string;
  /** 정적 클래스 매핑 — Tailwind purge 때문에 동적 조합 금지 */
  accent: {
    text: string;
    bg: string;
    softBg: string;
    border: string;
    focusRing: string;
  };
};

export const TABS: TabMeta[] = [
  {
    key: "tenant",
    path: "/tenant",
    title: "임대차계약",
    description: "계약 전 주소·보증금만으로 전세 위험도를 진단합니다.",
    accent: {
      text: "text-tenant",
      bg: "bg-tenant",
      softBg: "bg-tenant-soft",
      border: "border-tenant",
      focusRing: "focus:border-tenant",
    },
  },
  {
    key: "underwrite",
    path: "/underwrite",
    title: "HUG 심사",
    description: "보증 신청 건의 승인 여부와 예상 손실을 심사합니다.",
    accent: {
      text: "text-underwrite",
      bg: "bg-underwrite",
      softBg: "bg-underwrite-soft",
      border: "border-underwrite",
      focusRing: "focus:border-underwrite",
    },
  },
  {
    key: "monitor",
    path: "/monitor",
    title: "모니터링",
    description: "보증 발급 이후 계약의 등급 변동과 경보를 추적합니다.",
    accent: {
      text: "text-monitor",
      bg: "bg-monitor",
      softBg: "bg-monitor-soft",
      border: "border-monitor",
      focusRing: "focus:border-monitor",
    },
  },
  {
    key: "recovery",
    path: "/recovery",
    title: "든든전세",
    description: "대위변제 이후 사건별 최적 회수 경로를 판정합니다.",
    accent: {
      text: "text-recovery",
      bg: "bg-recovery",
      softBg: "bg-recovery-soft",
      border: "border-recovery",
      focusRing: "focus:border-recovery",
    },
  },
];

export const getTab = (key: TabKey): TabMeta => TABS.find((t) => t.key === key)!;
