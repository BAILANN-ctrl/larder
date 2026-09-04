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
        bg: "#f7f8fa",
        surface: "#ffffff",
        border: "#e2e5e9",
        text: "#1c1e21",
        muted: "#6b7280",
        primary: {
          DEFAULT: "#1f7a4d",
          dark: "#16603c",
        },
        locked: "#b45309",
      },
      borderRadius: {
        DEFAULT: "10px",
      },
      boxShadow: {
        DEFAULT: "0 1px 3px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
