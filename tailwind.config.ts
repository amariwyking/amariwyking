import { Manuale } from "next/font/google";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'media',
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
      fontFamily: {
        workSans: ['var(--font-work-sans)'],
        kodeMono: ['var(--font-kode-mono)'],
        manuale: ['var(--font-manuale)'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },

  plugins: [
    require('@tailwindcss/typography'),
  ]
};

export default config;