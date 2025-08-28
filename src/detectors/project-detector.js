import { promises as fs } from 'fs';
import path from 'path';

// A map of framework names to the config files that identify them.
const FRAMEWORK_CONFIGS = {
  'Next.js': 'next.config.js',
  'Vite': 'vite.config.js',
  'Astro': 'astro.config.mjs',
};

export async function detectFramework(projectDir) {
  for (const [framework, configFile] of Object.entries(FRAMEWORK_CONFIGS)) {
    const configPath = path.join(projectDir, configFile);
    try {
      await fs.access(configPath);
      return framework; // Found it!
    } catch (error) {
      // File doesn't exist, continue checking for others.
    }
  }
  return 'Unknown'; // Didn't find any known framework configs.
}