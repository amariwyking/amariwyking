// import type { Config } from "tailwindcss";

const withMT = require("@material-tailwind/react/utils/withMT")

module.exports = withMT({
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
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
});

// const config: Config = {
//   content: [
//     "./pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     fontSize: {
//       xs: '0.625rem',
//       sm: '0.75rem',
//       base: '1.0rem',
//       l: '1.125rem',
//       xl: '1.25rem',
//       '2xl': '1.5rem',
//       '3xl': '1.875rem',
//       '4xl': '2.25rem',
//       '5xl': '2.75rem',
//       '6xl': '3.25rem',
//       '7xl': '3.75rem',
//       '8xl': '4.5rem',
//       '9xl': '5.625rem'
//     },
//     extend: {
//       backgroundImage: {
//         "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
//         "gradient-conic":
//           "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
//       },
//     },
//   },

//   plugins: [
//     require('tailwind-typewriter')({
//       wordsets: {
//         construction: {
//           words: [
//             'this website is under construction',
//           ],
//           delay: 0.50,
//           writeSpeed: 0.05,
//           blinkSpeed: 1.00,
//           eraseSpeed: 0,
//           repeat: 0,
//         },

//         upload: {
//           words: [
//             'Upload an image for the gallery',
//           ],
//           delay: 0.25,
//           writeSpeed: 0.025,
//           blinkSpeed: 0,
//           eraseSpeed: 0,
//           repeat: 0,
//         }
//       }
//     }),
//   ]
// };
// export default config;
