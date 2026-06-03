import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#561d70",
          "purple-light": "#7b3fa0",
          "purple-deep": "#3d1452",
          pink: "#c084c8",
          gold: "#c9a84c",
          dark: "#1a0a24",
          "text-dark": "#2d1b3d",
          "off-white": "#faf7fc",
          "light-gray": "#f3eef7",
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "float-down": "floatDown 2s ease-in-out infinite",
        "pulse-slow": "pulseSlow 2s ease-in-out infinite",
        "count-up": "countUp 1.5s ease-out forwards",
        "ken-burns": "kenBurns 8s ease-in-out infinite alternate",
      },
      keyframes: {
        floatDown: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(8px)" },
        },
        pulseSlow: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.8" },
        },
        kenBurns: {
          "0%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1.0)" },
        },
      },
      transitionTimingFunction: {
        "power3-out": "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    },
  },
  plugins: [],
}
export default config
