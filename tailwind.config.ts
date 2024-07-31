import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    require('tailwind-typewriter')({
      wordsets: {
        construction: {
            words: ['this website is under construction'],
            delay: 1,
            repeat: 0,
            writeSpeed: 0.1,
            eraseSpeed: 0,
            blinkSpeed: 1,
            caretSpacing: '0.3em',
        }
      }
    }),
  ]
};
export default config;
