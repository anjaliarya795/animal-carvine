/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      screens: {
        sm: "640p",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Open Sans", "Arial", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Dark theme with orange accents
        brandStart: "#ff8800",
        brandEnd: "#ff6600",
        bgCard: "#1e1e1e",
        bgDark: "#0f0f0f",
        bgDarker: "#0a0a0a",
        primary: "#ff8800",
        secondary: "#ff6600",
        "primary-light": "#ffaa33",
        "primary-dark": "#cc6600",
        "text-light": "#ffffff",
        "text-gray": "#a0a0a0",
        "text-muted": "#707070",
        "border-dark": "#2a2a2a",
        "border-gray": "#333333",
      },
    },
  },
  plugins: [],
};
