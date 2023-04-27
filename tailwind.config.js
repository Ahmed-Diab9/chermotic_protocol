/** @type {import('tailwindcss').Config} */

export const content = ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"];
export const darkMode = "class";
export const theme = {
  extend: {
    fontFamily: {
      // sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      // mono: ["VCR mono", ...defaultTheme.fontFamily.sans],
      // serif: ["OffBit regular", "VCR mono", ...defaultTheme.fontFamily.serif],
      // display: ["VCR mono", ...defaultTheme.fontFamily.sans],
      // body: ["VCR mono", ...defaultTheme.fontFamily.sans],
    },
    colors: {
      current: "currentColor",
      active: "#efc353",
      long: "#a6d85b",
      short: "#fb6115",
      line: "#1F1F1F",
      linelight: "rgba(216,216,216,.3)",
      solid: "#17171F",
    },
    dropShadow: {
      toast: "4px 4px 40px rgba(239, 195, 83, 0.15)",
    },
    fontSize: {
      xs: ["11px", "17px"],
      sm: ["12px", "18px"],
      base: ["13px", "19px"],
      lg: ["15px", "21px"],
      xl: ["18px", "24px"],
      "2xl": ["20px", "28px"],
      "3xl": ["24px", "32px"],
      "4xl": ["28px", "38px"],
    },
  },
};
export const plugins = [];
