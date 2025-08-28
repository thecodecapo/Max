#!/usr/bin/env node

import cac from 'cac';
import { prune } from './src/commands/prune.js';

const cli = cac('max');

// Define the 'prune' command
cli
  .command('prune', 'Find unused dependencies in your project')
  .action(() => {
    const projectDirectory = process.cwd();
    prune(projectDirectory);
  });

cli.help();
cli.version('0.0.1'); // Use the version from package.json

cli.parse();