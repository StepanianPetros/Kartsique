export default {
  theme: {
    extend: {
      colors: {
        brand: {
          glow: "#61eaff",
          neon: "#3f83f8",
          dark: "#0a0f1e",
          accent: "#6c63ff",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(97, 234, 255, 0.45)",
      },
      animation: {
        gradient: "gradient 14s ease infinite",
        float: "float 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
      },
      keyframes: {
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 12px rgba(97,234,255,0.35)" },
          "50%": { boxShadow: "0 0 24px rgba(97,234,255,0.6)" },
        },
      },
    },
  },
};
