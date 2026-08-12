import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#06061c",
          900: "#0b0a30",
          800: "#14134a",
          700: "#1a1a63",
        },
        neon: {
          DEFAULT: "#33e07d",
          2: "#6effae",
          dark: "#12a85a",
        },
        line: "rgba(120,140,255,.14)",
        card: "#0f0e3a",
        muted: "#8b93c4",
        ink: "#eef2ff",
        inkDim: "#04331c",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 18px rgba(51,224,125,.45), 0 0 46px rgba(51,224,125,.25)",
        card: "0 14px 34px rgba(0,0,0,.45)",
        fab: "0 10px 30px rgba(37,211,102,.45)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        glow: {
          "0%,100%": { textShadow: "0 0 14px rgba(51,224,125,.45), 0 0 36px rgba(51,224,125,.22)" },
          "50%": { textShadow: "0 0 22px rgba(51,224,125,.7), 0 0 60px rgba(51,224,125,.4)" },
        },
        drop: {
          from: { transform: "translateY(-60px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        fade: { to: { opacity: "1" } },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        glow: "glow 3.5s ease-in-out infinite",
        drop: "drop 1s cubic-bezier(.2,.85,.25,1) backwards",
        fade: "fade 1s ease forwards",
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
