/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0f",
          surface: "#12121a",
          card: "#181822",
          border: "#24242f",
        },
        brand: {
          purple: "#7c3aed",
          pink: "#ec4899",
          blue: "#3b82f6",
          lime: "#a3e635",
          action: "#5166e6",
        },
        status: {
          success: "#22c55e",
          progress: "#8b5cf6",
          pending: "#f59e0b",
          danger: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(90deg, #7c3aed 0%, #ec4899 50%, #3b82f6 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(236,72,153,0.15) 50%, rgba(59,130,246,0.15) 100%)",
      },
      borderRadius: {
        xl2: "20px",
      },
    },
  },
  plugins: [],
};
