export const FRAMEWORK_RULES = {
  'Next.js': new Set([
    'next', 'react', 'react-dom', 'eslint', 'eslint-config-next',
    'typescript', 'postcss', 'tailwindcss', 'autoprefixer',
    '@tailwindcss/postcss'
  ]),
  'Vite': new Set([
    'vite', '@vitejs/plugin-react', 'react', 'react-dom', 'eslint',
    'typescript', 'postcss', 'tailwindcss', 'autoprefixer'
  ]),
  'Astro': new Set([
    'astro', '@astrojs/check', '@astrojs/tailwind', 'react',
    '@astrojs/react', 'tailwindcss', 'typescript'
  ]),
  'Node.js': new Set([]),
};