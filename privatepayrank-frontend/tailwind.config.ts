import type { Config } from "tailwindcss";
import { designTokens } from "./design-tokens";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: designTokens.colors.light.primary,
        secondary: designTokens.colors.light.secondary,
        accent: designTokens.colors.light.accent,
        background: designTokens.colors.light.background,
        surface: designTokens.colors.light.surface,
        text: designTokens.colors.light.text,
        "text-secondary": designTokens.colors.light.textSecondary,
      },
      fontFamily: {
        sans: designTokens.typography.fontFamily.sans,
        mono: designTokens.typography.fontFamily.mono,
      },
      fontSize: designTokens.typography.sizes,
      borderRadius: designTokens.borderRadius,
      boxShadow: designTokens.shadows,
      transitionDuration: {
        DEFAULT: `${designTokens.transitions.duration}ms`,
      },
      transitionTimingFunction: {
        DEFAULT: designTokens.transitions.easing,
      },
    },
  },
  plugins: [],
};

export default config;





