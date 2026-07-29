/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          navy: "#0F2C59",
          DEFAULT: "#0F2C59"
        },
        accent: {
          saffron: "#E07A5F",
          DEFAULT: "#E07A5F"
        },
        success: {
          green: "#1F4E3D",
          DEFAULT: "#1F4E3D"
        },
        bg: {
          cream: "#FAFAF5"
        },
        text: {
          coal: "#1C1C1C"
        },
        accessible: {
          blue: "#1D4ED8"
        }
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "Noto Sans Devanagari", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
