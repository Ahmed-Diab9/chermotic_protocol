/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

const monospace = (function () {
  const fonts = defaultTheme.fontFamily.mono;
  const monospace = fonts.find((font) => font === "monospace");
  if (monospace === null || monospace === undefined) {
    throw new Error("no monospace");
  }
  return monospace;
})();

export const content = ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"];
export const darkMode = "class";
export const theme = {
  extend: {
    fontFamily: {
      mono: ["Source Code Pro", monospace],
      // sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      // serif: ["OffBit regular", "VCR mono", ...defaultTheme.fontFamily.serif],
      // display: ["VCR mono", ...defaultTheme.fontFamily.sans],
      // body: ["VCR mono", ...defaultTheme.fontFamily.sans],
    },
    colors: {
      current: "currentColor",
      black: "#030303",
      gray: "#D4D4D4",
      grayL: "#EEEEEE",

      standby: "#FF8A00",
      completed: "#00E23F",
      inprocess: "#08E3D6",

      long: "#a6d85b",
      short: "#fb6115",
    },
    dropShadow: {
      // sm: "4px 4px 32px rgba(121, 121, 121, 0.25)",
      md: "4px 4px 20px rgba(121, 121, 121, 0.08)",
      lg: "4px 4px 32px rgba(229, 229, 229, 0.18)",
      xl: "4px 4px 60px rgba(229, 229, 229, 0.16)",
    },
    fontSize: {
      xs: ["10px", "12px"],
      sm: ["11px", "14px"],
      base: ["13px", "16px"],
      lg: ["16px", "20px"],
      xl: ["20px", "24px"],
      "2xl": ["24px", "28px"],
      "3xl": ["28px", "34px"],
      "4xl": ["36px", "40px"],
    },
    fontWeight: {
      light: 200,
      normal: 300,
      medium: 400,
      semibold: 500,
      bold: 600,
      extrabold: 700,
    },
    animation: {
      "spin-slow": "spin 3s linear infinite",
    },
  },
};
export const plugins = [];
