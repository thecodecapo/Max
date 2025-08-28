import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ora from 'ora';
import kleur from 'kleur';
import Table from 'cli-table3';
import { execa } from 'execa';
import { findSourceFiles } from '../utils/fileFinder.js';
import { extractDependencies } from '../core/parser.js';
import { detectFramework } from '../detectors/project-detector.js'; // <-- NEW IMPORT
import { FRAMEWORK_RULES } from '../detectors/rules.js'; // <-- NEW IMPORT

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ourPackageJsonPath = path.join(__dirname, '../../package.json');
const ourPackageJson = JSON.parse(await fs.readFile(ourPackageJsonPath, 'utf8'));
const ourPackageName = ourPackageJson.name;

export async function prune(projectDir, options) {
  const spinner = ora(kleur.yellow('Analyzing project dependencies...')).start();
  try {
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    const installedDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const installedDepNames = new Set(Object.keys(installedDeps));
    
    // --- NEW: Detect the framework and get its rules ---
    const framework = await detectFramework(projectDir);
    spinner.text = `Detected framework: ${kleur.cyan(framework)}`;
    const frameworkAllowList = FRAMEWORK_RULES[framework] || new Set();

    const sourceFiles = await findSourceFiles(projectDir);
    spinner.text = `Analyzing ${kleur.cyan(sourceFiles.length)} source files...`;
    
    // Start with the framework's implicit dependencies
    const usedDepNames = new Set(frameworkAllowList); 
    
    const parsingPromises = sourceFiles.map(file => extractDependencies(file));
    const dependencyLists = await Promise.all(parsingPromises);
    for (const depList of dependencyLists) {
      for (const dep of depList) {
        // Add explicitly imported dependencies
        if (installedDepNames.has(dep)) usedDepNames.add(dep);
      }
    }
    spinner.succeed(kleur.green(`Analysis complete. Found ${kleur.cyan(usedDepNames.size)} dependencies in use.`));
    
    let unusedDeps = [];
    for (const installed of installedDepNames) {
      // Also protect all @types packages
      if (!usedDepNames.has(installed) && !installed.startsWith('@types/')) {
        unusedDeps.push({ name: installed, version: installedDeps[installed] });
      }
    }
    
    unusedDeps = unusedDeps.filter(dep => dep.name !== ourPackageName);

    // ... The rest of the reporting and applying logic is the same ...
    if (unusedDeps.length > 0) {
      console.log(kleur.bold().yellow('\n--- Unused Dependencies Found ---'));
      const table = new Table({ head: [kleur.bold('Package Name'), kleur.bold('Version')], colWidths: [40, 20] });
      unusedDeps.forEach(dep => table.push([dep.name, dep.version]));
      console.log(table.toString());
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