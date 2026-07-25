/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 작업 캔버스
        canvas: "#F5F6F8",
        surface: "#FFFFFF",
        ink: "#101B2B",
        slate: "#1F2B3D",
        body: "#455263",
        label: "#3A4656",
        muted: "#7C8798",
        faint: "#A3ADBB",
        divider: "#E3E7EC",
        hairline: "#CBD3DC",
        // 관제 레일 (다크 네이비)
        rail: {
          DEFAULT: "#0A1628",
          soft: "#13233B",
          line: "#22385A",
          text: "#8FA3BF",
        },
        // 기관 앵커
        hug: { DEFAULT: "#1268CC", soft: "#E8F0FB" },
        primary: { DEFAULT: "#1268CC", soft: "#E8F0FB" },
        // 파이프라인 스테이지 (PNG 노드 색 계승 — 해당 스테이지 컨텍스트에서만)
        stage: {
          assess: { DEFAULT: "#1268CC", soft: "#E8F0FB" },
          monitor: { DEFAULT: "#2F80ED", soft: "#EAF3FE" },
          notice: { DEFAULT: "#16A34A", soft: "#E8F7EE" },
          policy: { DEFAULT: "#16325C", soft: "#E9EEF6" },
          strategy: { DEFAULT: "#7C5CD6", soft: "#F1EDFB" },
          incident: { DEFAULT: "#E8890C", soft: "#FDF3E4" },
          safe: { DEFAULT: "#12A594", soft: "#E6F6F4" },
          auction: { DEFAULT: "#D6455D", soft: "#FBEAED" },
          data: { DEFAULT: "#C29A1B", soft: "#FAF4E2" },
        },
        // 기존 탭 키 호환 (구 컴포넌트 클래스 참조 유지)
        tenant: { DEFAULT: "#16A34A", soft: "#E8F7EE" },
        underwrite: { DEFAULT: "#1268CC", soft: "#E8F0FB" },
        monitor: { DEFAULT: "#2F80ED", soft: "#EAF3FE" },
        recovery: { DEFAULT: "#12A594", soft: "#E6F6F4" },
        // 등급 신호등 — 항상 글자 등급 병기
        grade: {
          safe: { DEFAULT: "#16A34A", soft: "#E8F7EE" },
          caution: { DEFAULT: "#F59E0B", soft: "#FEF5E7" },
          danger: { DEFAULT: "#DC2626", soft: "#FDECEC" },
        },
      },
      fontFamily: {
        sans: [
          "IBM Plex Sans KR",
          "Pretendard",
          "-apple-system",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "sans-serif",
        ],
        mono: ["IBM Plex Mono", "SF Mono", "Menlo", "monospace"],
      },
      transitionDuration: {
        fast: "120ms",
        std: "200ms",
        slow: "320ms",
      },
      keyframes: {
        "flat-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "flat-pulse": "flat-pulse 1.4s ease-in-out infinite",
        "fade-in": "fade-in 200ms ease-out both",
      },
    },
  },
  plugins: [],
};
