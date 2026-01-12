import forms from "@tailwindcss/forms";
import containerQueries from "@tailwindcss/container-queries";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#13ec49",
        "primary-dark": "#0db938",
        "background-light": "#f6f8f6",
        "background-dark": "#102215",
        "surface-light": "#ffffff",
        "surface-dark": "#1c2e21",
        "text-main-light": "#111813",
        "text-main-dark": "#ffffff",
        "text-secondary-light": "#61896b",
        "text-secondary-dark": "#8fa895",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        full: "9999px",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [forms, containerQueries],
};
