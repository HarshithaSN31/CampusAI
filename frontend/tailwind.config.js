/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          bg: "#070b14",
          surface: "rgba(15, 23, 42, 0.75)",
          border: "rgba(51, 65, 85, 0.4)",
          accent: "#06b6d4",
          teal: "#14b8a6",
          dark: "#0b1220"
        }
      }
    },
  },
  plugins: [],
}
