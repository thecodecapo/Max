import { promises as fs } from 'fs';
import path from 'path';

const FRAMEWORK_CONFIGS = {
  'Next.js': ['next.config.js', 'next.config.mjs', 'next.config.ts'],
  'Vite': ['vite.config.js', 'vite.config.ts', 'vite.config.mjs'],
  'Astro': ['astro.config.mjs', 'astro.config.js', 'astro.config.ts'],
};

export async function detectFramework(projectDir) {
  for (const [framework, configFiles] of Object.entries(FRAMEWORK_CONFIGS)) {
    for (const configFile of configFiles) {
      const configPath = path.join(projectDir, configFile);
      try {
        await fs.access(configPath);
        return framework; // Found a framework
      } catch (error) { /* Continue */ }
    }
  }

  // If no framework is found, check for a package.json to classify as Node.js
  try {
    await fs.access(path.join(projectDir, 'package.json'));
    return 'Node.js';
  } catch (error) { /* Continue */ }

  return 'Unknown';
}