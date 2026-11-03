import type { Config } from "tailwindcss";

// Mørk tilstand følger systemets indstilling (Tailwind's standard: "media")
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};

export default config;
