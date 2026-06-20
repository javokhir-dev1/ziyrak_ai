import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Legacy (kept for other pages)
        sidebar: '#ffffff',
        accent: '#4648d4',
        'accent-light': '#e1e0ff',
        'accent-dark': '#2f2ebe',

        // Design system
        primary: '#4648d4',
        'primary-container': '#6063ee',
        'primary-fixed': '#e1e0ff',
        'on-primary': '#ffffff',
        'on-primary-container': '#fffbff',
        secondary: '#8127cf',
        'secondary-container': '#9c48ea',
        'on-secondary-container': '#fffbff',
        surface: '#f7f9fb',
        'surface-dim': '#d8dadc',
        'surface-bright': '#f7f9fb',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f6',
        'surface-container': '#eceef0',
        'surface-container-high': '#e6e8ea',
        'surface-container-highest': '#e0e3e5',
        'surface-variant': '#e0e3e5',
        'on-surface': '#191c1e',
        'on-surface-variant': '#464554',
        background: '#f7f9fb',
        'on-background': '#191c1e',
        outline: '#767586',
        'outline-variant': '#c7c4d7',
        'inverse-surface': '#2d3133',
        'inverse-on-surface': '#eff1f3',
        'inverse-primary': '#c0c1ff',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
      },
      fontFamily: {
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
