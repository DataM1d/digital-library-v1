import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        premium: "0 8px 30px rgba(0,0,0,0.04), 0 20px 80px rgba(0,0,0,0.03)",
        glass: "inset 0 0 0 1px rgba(255,255,255,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
