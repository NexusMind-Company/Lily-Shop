import forms from "@tailwindcss/forms";
import containerQueries from "@tailwindcss/container-queries";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: "#13ec49",
        "primary-dark": "#0db938",
        
        // Lily brand colors (Pink/Purple theme)
        lily: {
          DEFAULT: "#E91E63", // Main pink
          50: "#FCE4EC",
          100: "#F8BBD0",
          200: "#F48FB1",
          300: "#F06292",
          400: "#EC407A",
          500: "#E91E63",
          600: "#D81B60",
          700: "#C2185B",
          800: "#AD1457",
          900: "#880E4F",
        },
        
        purple: {
          DEFAULT: "#9C27B0",
          50: "#F3E5F5",
          100: "#E1BEE7",
          200: "#CE93D8",
          300: "#BA68C8",
          400: "#AB47BC",
          500: "#9C27B0",
          600: "#8E24AA",
          700: "#7B1FA2",
          800: "#6A1B9A",
          900: "#4A148C",
        },

        // Background colors
        "background-light": "#f6f8f6",
        "background-dark": "#102215",
        "surface-light": "#ffffff",
        "surface-dark": "#1c2e21",
        
        // Text colors
        "text-main-light": "#111813",
        "text-main-dark": "#ffffff",
        "text-secondary-light": "#61896b",
        "text-secondary-dark": "#8fa895",
        
        // Semantic colors
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
        info: "#3B82F6",
        
        // Neutral grays
        ash: "#9CA3AF",
        "dark-ash": "#6B7280",
      },
      
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        "3xl": "3rem",
        full: "9999px",
      },
      
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        glow: "0 0 20px rgba(233, 30, 99, 0.3)",
        "glow-lg": "0 0 40px rgba(233, 30, 99, 0.4)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "lily-gradient": "linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)",
        "lily-gradient-soft": "linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 100%)",
      },
      
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "spin-slow": "spin 3s linear infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
      
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [forms, containerQueries],
};
