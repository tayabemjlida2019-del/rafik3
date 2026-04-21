/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#003580",
        "primary-light": "#0071c2",
        "primary-dark": "#00264d",
        secondary: "#065f46",
        accent: "#C6A75E",
        "accent-light": "#e8d5a0",
        "accent-dark": "#8C6B2E",
        surface: "#f8f9fa",
        "surface-dark": "#0a0e1a",
        "card-dark": "#111827",
        emerald: "#10b981",
      },
    },
  },
  plugins: [],
};
