/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f1f3f5",
        surface: "#ffffff",
        ink: "#1d2024",
        slate: "#3c3c3c",
        body: "#606060",
        label: "#4b525a",
        muted: "#858d94",
        faint: "#9ca5ad",
        divider: "#dee3e8",
        hairline: "#d2d2d2",
        primary: { DEFAULT: "#1268CC", soft: "#EAF2FC" },
        tenant: { DEFAULT: "#16A34A", soft: "#E8F7EE" },
        underwrite: { DEFAULT: "#1268CC", soft: "#EAF2FC" },
        monitor: { DEFAULT: "#5EA8E5", soft: "#EFF8FE" },
        recovery: { DEFAULT: "#0B3B7A", soft: "#E9EFF7" },
        grade: {
          safe: { DEFAULT: "#16A34A", soft: "#E8F7EE" },
          caution: { DEFAULT: "#F59E0B", soft: "#FEF5E7" },
          danger: { DEFAULT: "#DC2626", soft: "#FDECEC" },
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "sans-serif",
        ],
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
