import { readFile } from 'fs/promises';
import glob from 'fast-glob';
import path from 'path';
import ignore from 'ignore';
import { DEFAULTS_IGNORE_PATTERNS } from '../consts';
import { toPosix } from './path';

/**
 * Find all ignore files (e.g., .gitignore) in the project
 * @param ignoreFileName - The name of the ignore file (e.g., '.gitignore')
 */
export const findIgnoreFiles = async (
  ignoreFileName: string,
): Promise<string[]> => {
  try {
    const pattern = `**/${ignoreFileName}`;
    const files = await glob(pattern, {
      cwd: process.cwd(),
      ignore: DEFAULTS_IGNORE_PATTERNS,
    });
    return files;
  } catch (error) {
    console.warn(`Warning: Error finding ${ignoreFileName} files:`, error);
    return [];
  }
};

/**
 * Parse an ignore file content and return its rules
 */
const parseIgnoreFile = (content: string): string[] => {
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
 * Load and combine rules from multiple ignore files
 * @param ignoreFiles - Array of file paths to ignore files
 */
export const loadIgnoreRules = async (
  ignoreFiles: string[],
): Promise<string[]> => {
  const allRules: string[] = [];

  for (const file of ignoreFiles) {
    try {
      const content = await readFile(file, 'utf-8');
      const rules = parseIgnoreFile(content);

      const ignoreDir = path.dirname(file);

      // Make rules relative to the ignore file's directory
      const dirRelativeRules = rules.map((rule) => {
        const isNegated = rule.startsWith('!');
        const cleanRule = isNegated ? rule.slice(1) : rule;
        const joined = toPosix(path.join(ignoreDir, cleanRule));

        return isNegated ? `!${joined}` : joined;
      });

      allRules.push(...dirRelativeRules);
    } catch (error) {
      console.warn(`Warning: Error reading ignore file ${file}:`, error);
    }
  }

  return allRules;
};

/**
 * Filter files by ignore rules (e.g., .gitignore) recursively
 * @param files - Array of file paths to filter
 * @param ignoreFileName - The name of the ignore file (default: '.gitignore')
 */
export const filterByIgnoreFile = async (
  files: string[],
  ignoreFileName: string = '.gitignore',
): Promise<string[]> => {
  try {
    const ignoreFiles = await findIgnoreFiles(ignoreFileName);

    if (ignoreFiles.length === 0) {
      return files;
    }

    return filterByIgnorePatterns(files, await loadIgnoreRules(ignoreFiles));
  } catch (error) {
    console.warn(
      `Warning: Error processing ${ignoreFileName} files, proceeding without filtering:`,
      error,
    );
    return files;
  }
};

export const filterByIgnorePatterns = (files: string[], patterns: string[]) => {
  const ig = ignore().add(patterns);

  return files.filter((file) => {
    const relativePath = toPosix(path.relative(process.cwd(), file));
    return !ig.ignores(relativePath);
  });
};
