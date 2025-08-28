#!/usr/bin/env node

import cac from 'cac';
import { prune } from './src/commands/prune.js';

const cli = cac('max');

cli
  .command('prune', 'Find and remove unused dependencies')
  // --- Add an option for the --apply flag ---
  .option('--apply', 'Apply the changes and remove the packages')
  .action((options) => { // <-- 'options' contains our flags
    const projectDirectory = process.cwd();
    // --- Pass the options to our prune function ---
    prune(projectDirectory, options);
  });

cli.help();
cli.version('0.0.1');

cli.parse();