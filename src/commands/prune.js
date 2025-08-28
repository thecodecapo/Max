import { promises as fs } from 'fs';
import path from 'path';
import ora from 'ora';
import kleur from 'kleur';
import Table from 'cli-table3';
import { execa } from 'execa'; // <-- Import execa
import { findSourceFiles } from '../utils/fileFinder.js';
import { extractDependencies } from '../core/parser.js';

// --- The function now accepts 'options' ---
export async function prune(projectDir, options) {
  const spinner = ora(kleur.yellow('Analyzing project dependencies...')).start();

  try {
    // ... (Steps 1, 2, 3, and 4 are exactly the same as before)
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    const installedDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const installedDepNames = new Set(Object.keys(installedDeps));
    spinner.text = `Found ${kleur.cyan(installedDepNames.size)} installed dependencies.`;
    const sourceFiles = await findSourceFiles(projectDir);
    spinner.text = `Analyzing ${kleur.cyan(sourceFiles.length)} source files...`;
    const usedDepNames = new Set();
    const parsingPromises = sourceFiles.map(file => extractDependencies(file));
    const dependencyLists = await Promise.all(parsingPromises);
    for (const depList of dependencyLists) {
      for (const dep of depList) {
        if (installedDepNames.has(dep)) usedDepNames.add(dep);
      }
    }
    spinner.succeed(kleur.green(`Analysis complete. Found ${kleur.cyan(usedDepNames.size)} dependencies in use.`));
    const unusedDeps = [];
    for (const installed of installedDepNames) {
      if (!usedDepNames.has(installed)) {
        unusedDeps.push({ name: installed, version: installedDeps[installed] });
      }
    }

    // 5. Report and (optionally) act on the results
    if (unusedDeps.length > 0) {
      console.log(kleur.bold().yellow('\n--- Unused Dependencies Found ---'));
      const table = new Table({ head: [kleur.bold('Package Name'), kleur.bold('Version')], colWidths: [40, 20] });
      unusedDeps.forEach(dep => table.push([dep.name, dep.version]));
      console.log(table.toString());
      
      // --- This is the new logic block ---
      if (options.apply) {
        spinner.start(kleur.yellow('Uninstalling packages...'));
        for (const dep of unusedDeps) {
          spinner.text = `Uninstalling ${kleur.cyan(dep.name)}...`;
          await execa('npm', ['uninstall', dep.name]);
        }
        spinner.succeed(kleur.green(`${unusedDeps.length} unused dependencies removed.`));
      } else {
        console.log(kleur.bold('\nThis was a dry run. To remove these packages, run again with the --apply flag.'));
      }
      
    } else {
      console.log(kleur.bold().green('\n✅ No unused dependencies found. Your project is clean!'));
    }
  } catch (error) {
    spinner.fail(kleur.red('An error occurred during analysis.'));
    console.error(error);
  }
}