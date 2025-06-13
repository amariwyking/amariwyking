import { mtConfig } from "@material-tailwind/react";
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
    mtConfig({
      radius: "1.5rem",
      fonts: {
        sans: "Inter",
      },
      colors: {
        background: "#ffffff",    // Main app background, largest color surface
        foreground: "#374151",    // Default text color on light background

        surface: {
          default: "#e5e7eb",     // Cards, dialogs, raised elements
          dark: "#d1d5db",        // Elevated surfaces in light mode
          light: "#f3f4f6",       // Lower elevation surfaces
          foreground: "#030712"   // Text color on surface elements
        },

        primary: {
          default: "#76DB61",     // Main action buttons, key interactive elements
          dark: "#5216eb",        // Hover/pressed states for primary actions
          light: "#724dff",       // Secondary primary elements, highlights
          foreground: "#f9fafb"   // Text on primary-colored backgrounds
        },

        secondary: {
          default: "#e5e7eb",     // Secondary buttons, less prominent elements
          dark: "#d1d5db",        // Hover states for secondary elements
          light: "#f3f4f6",       // Subtle highlights, backgrounds
          foreground: "#030712"   // Text on secondary-colored backgrounds
        },

        info: {
          default: "#0062ff",     // Informational messages, help text
          dark: "#0055dd",        // Pressed states for info elements
          light: "#007aff",       // Info badges, lighter notifications
          foreground: "#f9fafb"   // Text on info-colored backgrounds
        },

        success: {
          default: "#00bf6b",     // Positive actions, completion states
          dark: "#00a35f",        // Hover states for success elements
          light: "#02e585",       // Success indicators, badges
          foreground: "#f9fafb"   // Text on success-colored backgrounds
        },

        warning: {
          default: "#fca327",     // Warning messages, cautionary states
          dark: "#f67d0a",        // Hover states for warning elements
          light: "#fdba4c",       // Warning indicators, highlights
          foreground: "#f9fafb"   // Text on warning-colored backgrounds
        },

        error: {
          default: "#ef4444",     // Error messages, destructive actions
          dark: "#dc2626",        // Hover states for error elements
          light: "#f87171",       // Error indicators, alerts
          foreground: "#f9fafb"   // Text on error-colored backgrounds
        }
      },

      darkColors: {
        background: "#030712",    // Dark mode main background
        foreground: "#9ca3af",    // Default text color in dark mode

        surface: {
          default: "#1f2937",     // Dark mode cards and elevated surfaces
          dark: "#111827",        // Highest elevation in dark mode
          light: "#374151",       // Subtle elevation in dark mode
          foreground: "#f9fafb"   // Text on dark mode surfaces
        },

        primary: {
          default: "#6028ff",     // Primary actions in dark mode
          dark: "#5216eb",        // Hover states in dark mode
          light: "#724dff",       // Highlights in dark mode
          foreground: "#f9fafb"   // Text on primary colors in dark mode
        },

        secondary: {
          default: "#0062ff",     // Secondary elements in dark mode
          dark: "#111827",        // Hover states for secondary in dark
          light: "#374151",       // Light accents in dark mode
          foreground: "#f9fafb"   // Text on secondary in dark mode
        },

        info: {
          default: "#0062ff",     // Info states in dark mode
          dark: "#0055dd",        // Hover states for info in dark
          light: "#007aff",       // Info accents in dark mode
          foreground: "#f9fafb"   // Text on info colors in dark mode
        },

        success: {
          default: "#00bf6b",     // Success states in dark mode
          dark: "#00a35f",        // Hover states for success in dark
          light: "#02e585",       // Success accents in dark mode
          foreground: "#f9fafb"   // Text on success colors in dark
        },

        warning: {
          default: "#fca327",     // Warning states in dark mode
          dark: "#f67d0a",        // Hover states for warning in dark
          light: "#fdba4c",       // Warning accents in dark mode
          foreground: "#f9fafb"   // Text on warning colors in dark
        },

        error: {
          default: "#ef4444",     // Error states in dark mode
          dark: "#dc2626",        // Hover states for error in dark
          light: "#f87171",       // Error accents in dark mode
          foreground: "#f9fafb"   // Text on error colors in dark mode
        }
      }
    }),
    require('@tailwindcss/typography'),
    require('tailwind-typewriter')({
      wordsets: {
        construction: {
          words: [
            'this website is under construction',
          ],
          delay: 0.50,
          writeSpeed: 0.05,
          blinkSpeed: 1.00,
          eraseSpeed: 0,
          repeat: 0,
        },

        upload: {
          words: [
            'Upload an image for the gallery',
          ],
          delay: 0.25,
          writeSpeed: 0.025,
          blinkSpeed: 0,
          eraseSpeed: 0,
          repeat: 0,
        }
      }
    }),
  ]
};

export default config;