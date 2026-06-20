import { readFile } from 'fs/promises';
import glob from 'fast-glob';
import path from 'path';
import ignore from 'ignore';

/**
 * Find all .gitignore files in the project
 */
export const findGitignoreFiles = async (): Promise<string[]> => {
  try {
    const files = await glob('**/.gitignore', {
      cwd: process.cwd(),
      ignore: ['**/node_modules/**'],
    });
    return files;
  } catch (error) {
    console.warn('Warning: Error finding .gitignore files:', error);
    return [];
  }
};

/**
 * Parse a .gitignore file and return its rules
 */
const parseGitignore = (content: string): string[] => {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter(
      (line) =>
        line && // Not empty
        !line.startsWith('#'), // Not a comment
    );
};

/**
 * Load and combine rules from recursive/multiple .gitignore files
 * @see https://git-scm.com/docs/gitignore#_pattern_format
 */
export const loadGitignoreRules = async (
  gitignoreFiles: string[],
): Promise<string[]> => {
  const allRules: string[] = [];

  for (const file of gitignoreFiles) {
    try {
      const content = await readFile(file, 'utf-8');
      const rules = parseGitignore(content);

      // directory of this .gitignore
      const gitignoreDir = path.dirname(file);

      // to be relative to the gitignore location
      const dirRelativeRules = rules.map((rule) => {
        //handle negations
        if (rule.startsWith('!')) {
          return `!${path.join(gitignoreDir, rule.slice(1))}`;
        }
        return path.join(gitignoreDir, rule);
      });

      allRules.push(...dirRelativeRules);
    } catch (error) {
      console.warn(`Warning: Error reading .gitignore file ${file}:`, error);
    }
  }

  return allRules;
};


/**
 * Filter files by .gitignore rules recursively
 */
export const filterByGitignore = async (files: string[]): Promise<string[]> => {
  try {
    // Find all .gitignore files in the project
    const gitignoreFiles = await findGitignoreFiles();

    if (gitignoreFiles.length === 0) {
      return files;
    }

    // Create ignore instance with all rules
    const ig = ignore().add(await loadGitignoreRules(gitignoreFiles));

    return files.filter((file) => {
      // Get relative path from the root where gitignore rules apply
      const relativePath = path.relative(process.cwd(), file);
      return !ig.ignores(relativePath);
    });
  } catch (error) {
    console.warn(
      'Warning: Error processing .gitignore files, proceeding without filtering:',
      error,
    );
    return files;
  }
};

