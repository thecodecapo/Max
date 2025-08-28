import fg from 'fast-glob';

const SOURCE_FILE_EXTENSIONS = ['js', 'ts', 'jsx', 'tsx'];

export async function findSourceFiles(directory) {
  const patterns = SOURCE_FILE_EXTENSIONS.map(ext => `**/*.${ext}`);
  
  const files = await fg(patterns, {
    cwd: directory,
    ignore: ['node_modules/**'],
    absolute: true,
  });

  return files;
}