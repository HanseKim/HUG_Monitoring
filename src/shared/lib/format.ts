/** 12345678 → "12,345,678" */
export const comma = (n: number): string => n.toLocaleString("ko-KR");

/** 콤마 포함 문자열 → 숫자 (파싱 실패 시 NaN) */
export const uncomma = (s: string): number => Number(s.replace(/[^\d]/g, ""));

/** 원 단위 금액 → "3억 2,000만원" 요약 표기 */
export const formatKRWShort = (n: number): string => {
  if (!Number.isFinite(n)) return "-";
  const eok = Math.floor(n / 100_000_000);
  const man = Math.round((n % 100_000_000) / 10_000);
  if (eok > 0 && man > 0) return `${eok}억 ${comma(man)}만원`;
  if (eok > 0) return `${eok}억원`;
  if (man > 0) return `${comma(man)}만원`;
  return `${comma(n)}원`;
};

/** 원 단위 전체 표기 "320,000,000원" */
export const formatKRW = (n: number): string => `${comma(n)}원`;

export const formatPct = (n: number, digits = 1): string =>
  `${n.toFixed(digits)}%`;

export const formatDate = (iso: string): string => iso.slice(0, 10);
