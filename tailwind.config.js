/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

export const content = ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"];
export const darkMode = "class";
export const theme = {
  extend: {
    fontFamily: {
      mono: ["Source Code Pro", defaultTheme.fontFamily.monospace],
      // sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      // serif: ["OffBit regular", "VCR mono", ...defaultTheme.fontFamily.serif],
      // display: ["VCR mono", ...defaultTheme.fontFamily.sans],
      // body: ["VCR mono", ...defaultTheme.fontFamily.sans],
    },
    colors: {
      current: "currentColor",
      black: "#030303",
      grayL: "#EEEEEE",

      active: "#efc353",
      long: "#a6d85b",
      short: "#fb6115",
      line: "#D4D4D4",
      solid: "#17171F",
    },
    dropShadow: {
      sm: "4px 4px 32px rgba(121, 121, 121, 0.25)",
      md: "4px 4px 32px rgba(121, 121, 121, 0.18)",
      lg: "4px 4px 60px rgba(163, 163, 163, 0.16)",
    },
    fontSize: {
      xs: ["10px", "14px"],
      sm: ["11px", "14px"],
      base: ["13px", "16px"],
      lg: ["16px", "20px"],
      xl: ["18px", "22px"],
      "2xl": ["20px", "24px"],
      "3xl": ["24px", "38px"],
      "4xl": ["28px", "36px"],
    },
  },
};
export const plugins = [];
