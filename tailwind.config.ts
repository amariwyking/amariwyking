import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontSize: {
      xs: '0.625rem',
      sm: '0.75rem',
      base: '1.0rem',
      l: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '2.75rem',
      '6xl': '3.25rem',
      '7xl': '3.75rem',
      '8xl': '4.5rem',
      '9xl': '5.625rem'
    },
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
