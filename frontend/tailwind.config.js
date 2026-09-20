module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        void: "#070a0d",
        ink: "#0b0e11",
        panel: "#12171d",
        panel2: "#161b22",
        line: "#1e2630",
        graphite: "#2a323c",
        muted: "#8b95a1",
        fog: "#c3ccd6",
        chrome: "#e6edf3",
        cyan: {
          DEFAULT: "#2cc6e8",
          bright: "#5ce1ff",
          deep: "#0e7fa0",
        },
      },
      fontFamily: {
        display: ["'Chakra Petch'", "sans-serif"],
        sans: ["Manrope", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(44,198,232,0.35), 0 0 30px -6px rgba(44,198,232,0.5)",
        card: "0 20px 60px -30px rgba(0,0,0,0.9)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        pulseline: { "0%,100%": { opacity: 0.25 }, "50%": { opacity: 1 } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        spinslow: { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseline: "pulseline 3s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        spinslow: "spinslow 40s linear infinite",
      },
    },
  },
  plugins: [],
};
