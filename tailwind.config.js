/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

const monospace = (function () {
  const fonts = defaultTheme.fontFamily.mono;
  const monospace = fonts.find((font) => font === 'monospace');
  if (monospace === null || monospace === undefined) {
    throw new Error('no monospace');
  }
  return monospace;
})();

export const content = ['./index.html', './src/**/*.{js,ts,jsx,tsx}'];
export const darkMode = 'class';
export const theme = {
  extend: {
    fontFamily: {
      mono: ['Source Code Pro', monospace],
      // sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      // serif: ["OffBit regular", "VCR mono", ...defaultTheme.fontFamily.serif],
      // display: ["VCR mono", ...defaultTheme.fontFamily.sans],
      // body: ["VCR mono", ...defaultTheme.fontFamily.sans],
    },
    colors: {
      current: 'currentColor',
      transparent: 'transparent',
      error: 'rgb(var(--color-error)/ 1)',

      primary: {
        DEFAULT: 'rgb(var(--color-primary)/ 1)',
        light: 'rgb(var(--color-primary)/ 0.5)',
        lighter: 'rgb(var(--color-primary)/ 0.3)',
      },

      inverted: {
        DEFAULT: 'rgb(var(--color-inverted)/ 1)',
        light: 'rgb(var(--color-inverted)/ 0.5)',
        lighter: 'rgb(var(--color-inverted)/ 0.3)',
      },

      gray: {
        light: 'rgb(var(--color-gray-light)/ 1)',
        lighter: 'rgb(var(--color-gray-lighter)/ 1)',
        dark: 'rgb(var(--color-gray-dark)/ 1)',
        darker: 'rgb(var(--color-gray-darker)/ 1)',
      },

      paper: {
        DEFAULT: 'rgb(var(--color-paper)/ 1)',
        light: 'rgb(var(--color-gray-light)/ 0.2)',
        lighter: 'rgb(var(--color-gray-lighter)/ 0.2)',
        lightest: 'rgb(var(--color-paper-light)/ 1)',
        dark: 'rgb(var(--color-gray-dark)/ 0.2)',
        darker: 'rgb(var(--color-gray-darker)/ 0.2)',
        darkest: 'rgb(var(--color-paper-dark)/ 1)',
      },

      // primary: '#ddd',
      // 'primary-light': '#ddd',
      // 'primary-lighter': '#ddd',
    },

    boxShadow: {
      base: '4px 4px 20px rgba(121, 121, 121, 0.08)',
      md: '4px 4px 20px 0px rgba(229, 229, 229, 0.16)',
      lg: '4px 4px 32px rgba(229, 229, 229, 0.18)',
      xl: '4px 4px 60px rgba(229, 229, 229, 0.16)',
      modal: '4px 4px 60px 0px rgba(181, 181, 181, 0.16)',
    },
    fontSize: {
      xs: ['10px', 'normal'],
      sm: ['11px', 'normal'],
      base: ['12px', 'normal'],
      lg: ['14px', 'normal'],
      xl: ['16px', 'normal'],
      '2xl': ['18px', 'normal'],
      '3xl': ['20px', 'normal'],
      '4xl': ['24px', 'normal'],
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
      'spin-slow': 'spin 3s linear infinite',
    },
  },
};
export const plugins = [];
