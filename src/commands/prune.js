import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ora from 'ora';
import kleur from 'kleur';
import Table from 'cli-table3';
import { execa } from 'execa';
import { findSourceFiles } from '../utils/fileFinder.js';
import { extractDependencies } from '../core/parser.js';
import { detectFramework } from '../detectors/project-detector.js';
import { FRAMEWORK_RULES } from '../detectors/rules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ourPackageJsonPath = path.join(__dirname, '../../package.json');
const ourPackageJson = JSON.parse(await fs.readFile(ourPackageJsonPath, 'utf8'));
const ourPackageName = ourPackageJson.name;

export async function prune(projectDir, options) {
  const spinner = ora(kleur.yellow('Analyzing project dependencies...')).start();
  try {
    const framework = await detectFramework(projectDir);

    // --- THIS IS THE NEW GUARDRAIL ---
    if (framework === 'Unknown') {
      spinner.warn(kleur.yellow("Could not detect a known framework."));
      console.log(kleur.bold('\nMax works best with known frameworks to avoid false positives.'));
      console.log('Currently supported frameworks: Next.js, Vite, Astro.');
      console.log('To run the analysis anyway, use the --force flag (coming soon).');
      return; // Exit the function
    }
    
    spinner.text = `Detected framework: ${kleur.cyan(framework)}`;
    const frameworkAllowList = FRAMEWORK_RULES[framework] || new Set();

    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    const installedDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const installedDepNames = new Set(Object.keys(installedDeps));
    const sourceFiles = await findSourceFiles(projectDir);
    spinner.text = `Analyzing ${kleur.cyan(sourceFiles.length)} source files...`;
    
    const usedDepNames = new Set(frameworkAllowList);
    const parsingPromises = sourceFiles.map(file => extractDependencies(file));
    const dependencyLists = await Promise.all(parsingPromises);
    for (const depList of dependencyLists) {
      for (const dep of depList) {
        if (installedDepNames.has(dep)) usedDepNames.add(dep);
      }
    }
    spinner.succeed(kleur.green(`Analysis complete. Found ${kleur.cyan(usedDepNames.size)} dependencies in use.`));
    
    let unusedDeps = [];
    for (const installed of installedDepNames) {
      if (!usedDepNames.has(installed) && !installed.startsWith('@types/')) {
        unusedDeps.push({ name: installed, version: installedDeps[installed] });
      }
    }
    
    unusedDeps = unusedDeps.filter(dep => dep.name !== ourPackageName);

    if (unusedDeps.length > 0) {
      console.log(kleur.bold().yellow('\n--- Unused Dependencies Found ---'));
      const table = new Table({ head: [kleur.bold('Package Name'), kleur.bold('Version')], colWidths: [40, 20] });
      unusedDeps.forEach(dep => table.push([dep.name, dep.version]));
      console.log(table.toString());
      if (options.apply) {
        // ... (uninstall logic is the same)
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