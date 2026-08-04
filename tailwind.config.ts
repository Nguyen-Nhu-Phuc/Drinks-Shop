import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'on-primary': 'rgb(var(--on-primary) / <alpha-value>)',
        'on-night': 'rgb(var(--on-night) / <alpha-value>)',
        'canvas-night': 'rgb(var(--canvas-night) / <alpha-value>)',
        'canvas-night-elevated':
          'rgb(var(--canvas-night-elevated) / <alpha-value>)',
        'canvas-light': 'rgb(var(--canvas-light) / <alpha-value>)',
        'canvas-cream': 'rgb(var(--canvas-cream) / <alpha-value>)',
        'surface-elevated-dark':
          'rgb(var(--surface-elevated-dark) / <alpha-value>)',
        'shade-30': 'rgb(var(--shade-30) / <alpha-value>)',
        'shade-40': 'rgb(var(--shade-40) / <alpha-value>)',
        'shade-50': 'rgb(var(--shade-50) / <alpha-value>)',
        'shade-60': 'rgb(var(--shade-60) / <alpha-value>)',
        'shade-70': 'rgb(var(--shade-70) / <alpha-value>)',
        'hairline-light': 'rgb(var(--hairline-light) / <alpha-value>)',
        'hairline-dark': 'rgb(var(--hairline-dark) / <alpha-value>)',
        'aloe-10': 'rgb(var(--aloe-10) / <alpha-value>)',
        'pistachio-10': 'rgb(var(--pistachio-10) / <alpha-value>)',
        'link-cool-1': 'rgb(var(--link-cool-1) / <alpha-value>)',
        'link-cool-2': 'rgb(var(--link-cool-2) / <alpha-value>)',
        'link-cool-3': 'rgb(var(--link-cool-3) / <alpha-value>)',
        'link-mint': 'rgb(var(--link-mint) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Helvetica', 'Arial', 'sans-serif'],
        body: ['var(--font-body)', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display-xxl': [
          '96px',
          { lineHeight: '1', letterSpacing: '2.4px', fontWeight: '300' },
        ],
        'display-xl': ['70px', { lineHeight: '1', fontWeight: '300' }],
        'display-lg': ['55px', { lineHeight: '1.16', fontWeight: '300' }],
        'display-md': ['48px', { lineHeight: '1.14', fontWeight: '300' }],
        'heading-xl': [
          '28px',
          { lineHeight: '1.28', letterSpacing: '0.42px', fontWeight: '500' },
        ],
        'heading-lg': [
          '24px',
          { lineHeight: '1.14', letterSpacing: '0.36px', fontWeight: '400' },
        ],
        'heading-md': [
          '20px',
          { lineHeight: '1.4', letterSpacing: '0.3px', fontWeight: '500' },
        ],
        'heading-sm': [
          '18px',
          { lineHeight: '1.25', letterSpacing: '0.72px', fontWeight: '500' },
        ],
      },
      borderRadius: {
        xs: '4px',
        sm: '5px',
        md: '8px',
        lg: '12px',
        xl: '20px',
        pill: '9999px',
      },
      boxShadow: {
        'card-light':
          '0 8px 8px rgba(0,0,0,0.1), 0 4px 4px rgba(0,0,0,0.1), 0 2px 2px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.1)',
        'elevated-light': '0 25px 50px -12px rgba(0,0,0,0.25)',
      },
      maxWidth: {
        cinematic: '1600px',
        reading: '840px',
      },
    },
  },
  plugins: [],
};

export default config;
