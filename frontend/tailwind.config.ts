import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "rgb(var(--color-cream) / <alpha-value>)",
        linen: "rgb(var(--color-linen) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        espresso: "rgb(var(--color-espresso) / <alpha-value>)",
        cocoa: "rgb(var(--color-cocoa) / <alpha-value>)",
        taupe: "rgb(var(--color-taupe) / <alpha-value>)",
        olive: "rgb(var(--color-olive) / <alpha-value>)",
        clay: "rgb(var(--color-clay) / <alpha-value>)",
        gold: "rgb(var(--color-gold) / <alpha-value>)",
        ink: "#1B1611",
        chalk: "#F6F0E4",
        nutri: {
          a: "#2E7D32",
          b: "#8BC34A",
          c: "#FFD54F",
          d: "#FB8C00",
          e: "#E53935",
        },
      },
      fontFamily: {
        sans: ["var(--font-satoshi)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-satoshi)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-space)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        shell: "0 1px 2px rgba(33,26,18,0.04), 0 20px 50px -24px rgba(33,26,18,0.28)",
        float: "0 24px 70px -30px rgba(33,26,18,0.38)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.55)",
      },
      transitionTimingFunction: {
        luxe: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      animation: {
        marquee: "marquee 42s linear infinite",
        menuIn: "menuIn 0.9s cubic-bezier(0.32, 0.72, 0, 1) forwards",
        dotPulse: "dotPulse 1.2s cubic-bezier(0.32, 0.72, 0, 1) infinite",
      },
      keyframes: {
        marquee: {
          to: { transform: "translateX(-50%)" },
        },
        menuIn: {
          from: { opacity: "0", transform: "translateY(28px)", filter: "blur(6px)" },
          to: { opacity: "1", transform: "translateY(0)", filter: "blur(0)" },
        },
        dotPulse: {
          "0%, 100%": { opacity: "0.2", transform: "translateY(0)" },
          "50%": { opacity: "1", transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;