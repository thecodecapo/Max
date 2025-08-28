import { promises as fs } from 'fs';
import Parser, { Query } from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';

// Initialize the parser and language once
const parser = new Parser();
parser.setLanguage(JavaScript);

// Prepare the query once
const queryString = `
  (import_statement source: (string) @path)
  (call_expression
    function: (identifier) @_function
    arguments: (arguments (string) @path)
    (#eq? @_function "require")
  )
`;
const query = new Query(JavaScript, queryString);

export async function extractDependencies(filePath) {
  try {
    // 1. Read the file content
    const sourceCode = await fs.readFile(filePath, 'utf8');

    // 2. Parse the code into a tree
    const tree = parser.parse(sourceCode);

    // 3. Execute the query and get captures
    const captures = query.captures(tree.rootNode);

    // 4. Extract and return the module paths
    const modulePaths = captures
      .filter(capture => capture.name === 'path')
      .map(capture => capture.node.text.slice(1, -1));

    return modulePaths;
  } catch (error) {
    console.error(`Error parsing file ${filePath}:`, error);
    return []; // Return empty array on error
  }
}