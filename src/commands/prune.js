import { promises as fs } from 'fs';
import path from 'path';
import { findSourceFiles } from '../utils/fileFinder.js';
import { extractDependencies } from '../core/parser.js';

export async function prune(projectDir) {
  console.log('Starting analysis...');

  // 1. Get the "Installed" list from package.json
  const packageJsonPath = path.join(projectDir, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
  const installedDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  const installedDepNames = new Set(Object.keys(installedDeps));
  console.log(`Found ${installedDepNames.size} installed dependencies.`);

  // 2. Find all source files
  const sourceFiles = await findSourceFiles(projectDir);
  console.log(`Found ${sourceFiles.length} source files to analyze.`);

  // 3. Build the "Used" Set by parsing all files
  const usedDepNames = new Set();
  const parsingPromises = sourceFiles.map(file => extractDependencies(file));
  const dependencyLists = await Promise.all(parsingPromises);

  for (const depList of dependencyLists) {
    for (const dep of depList) {
      // We only care about installed packages, not relative files like './utils'
      if (installedDepNames.has(dep)) {
        usedDepNames.add(dep);
      }
    }
  }
  console.log(`Found ${usedDepNames.size} dependencies being used in the code.`);
  
  // 4. Compare the lists to find unused dependencies
  const unusedDeps = [];
  for (const installed of installedDepNames) {
    if (!usedDepNames.has(installed)) {
      unusedDeps.push(installed);
    }
  }

  // 5. Report the results
  if (unusedDeps.length > 0) {
    console.log('\n--- Unused Dependencies Found ---');
    unusedDeps.forEach(dep => console.log(`- ${dep}`));
    console.log('---------------------------------');
  } else {
    console.log('\n✅ No unused dependencies found. Your project is clean!');
  }

  return unusedDeps;
}