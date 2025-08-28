// This file maps a detected framework to its list of implicit dependencies.

export const FRAMEWORK_RULES = {
  'Next.js': new Set([
    'next',
    'react',
    'react-dom',
    'eslint',
    'eslint-config-next',
    'typescript',
    'postcss',
    'tailwindcss',
    'autoprefixer',
    // We should also protect all @types/* packages
  ]),
  
  'Vite': new Set([
    // We can add rules for Vite later
  ]),

  'Astro': new Set([
    // We can add rules for Astro later
  ]),
};