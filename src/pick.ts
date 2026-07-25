import { readFile, stat } from 'fs/promises';
import path from 'path';
import glob from 'fast-glob';
import { isBinaryFile } from './utils/binary';
import { addLineNumbers, formatSizeInMB } from './utils/pipes';
import { filterByIgnoreFile, filterByIgnorePatterns } from './utils/ignore';
import { DEFAULTS_IGNORE_PATTERNS } from './consts';
import {
  checkGitInstalled,
  cloneRepository,
  cleanupTempDir,
} from './utils/git';

export interface PickOptions {
  patterns: string[];
  absolute?: boolean;
  lines?: number;
  includeLineNumbers?: boolean;
  includeDocs?: boolean;
  gitignore?: boolean;
  codeignore?: boolean;
  dotIgnore?: boolean;
  defaultPatterns?: boolean;
  remote?: string;
  remoteBranch?: string;
  cwd?: string;
}

/**
 * Pick files matching patterns and return a Markdown string.
 */
export async function pickFiles(options: PickOptions): Promise<string> {
  const {
    patterns,
    absolute = false,
    lines,
    includeLineNumbers = false,
    includeDocs = false,
    gitignore = true,
    codeignore = true,
    dotIgnore = true,
    defaultPatterns = true,
    remote,
    remoteBranch,
    cwd = process.cwd(),
  } = options;

  let tempDir: string | null = null;
  const originalCwd = process.cwd();

  try {
    // If remote is specified, clone repository
    if (remote) {
      await checkGitInstalled();
      tempDir = await cloneRepository(remote, remoteBranch);
      process.chdir(tempDir);
    } else {
      process.chdir(cwd);
    }

    if (patterns.length === 0) {
      throw new Error('Provide at least one glob pattern.');
    }

    // Expand glob
    let files = await glob(patterns, {
      onlyFiles: true,
      dot: true,
      absolute: false,
      cwd: process.cwd(),
    });

    if (files.length === 0) {
      throw new Error('No files matched the given patterns.');
    }

    // Apply default filtering
    if (defaultPatterns) {
      files = filterByIgnorePatterns(files, DEFAULTS_IGNORE_PATTERNS);
      if (files.length === 0) {
        throw new Error(
          'No files remained after applying default codepicker rules.\n' +
            '  Try using --no-default-patterns to force including these files.',
        );
      }
    }

    // Apply .gitignore filtering
    if (gitignore) {
      files = await filterByIgnoreFile(files, '.gitignore');
      if (files.length === 0) {
        throw new Error(
          'No files remained after applying .gitignore rules.\n' +
            '  Try using --no-gitignore to force including these files.',
        );
      }
    }

    // Apply .ignore filtering
    if (dotIgnore) {
      files = await filterByIgnoreFile(files, '.ignore');
      if (files.length === 0) {
        throw new Error(
          'No files remained after applying .ignore rules.\n' +
            '  Try using --no-dot-ignore to force including these files.',
        );
      }
    }

    // Apply .codeignore filtering
    if (codeignore) {
      files = await filterByIgnoreFile(files, '.codeignore');
      if (files.length === 0) {
        throw new Error(
          'No files remained after applying .codeignore rules.\n' +
            '  Try using --no-codeignore to force including these files.',
        );
      }
    }

    let output = '';

    for (const file of files) {
      const displayPath = absolute ? path.join(process.cwd(), file) : file;
      output += await getFileContent(
        displayPath,
        lines,
        includeLineNumbers,
        process.cwd(),
      );
    }

    if (includeDocs) {
      const docPath = path.join(__dirname, '../CODEPICK_FORMAT.md');
      const docContent = await readFile(docPath, 'utf-8');
      output += '\n\n---\n\n';
      output += docContent;
    }

    return output.trim();
  } finally {
    if (tempDir) {
      process.chdir(originalCwd);
      await cleanupTempDir(tempDir);
    } else {
      process.chdir(cwd);
    }
  }
}

/**
 * Get file content with markdown format
 */
export async function getFileContent(
  filePath: string,
  maxLines?: number,
  showLineNumbers?: boolean,
  cwd?: string,
): Promise<string> {
  try {
    const resolvedPath = path.resolve(cwd || process.cwd(), filePath);
    const fileBuffer = await readFile(resolvedPath);

    if (isBinaryFile(fileBuffer)) {
      const stats = await stat(resolvedPath);
      const fileSize = stats.size;
      const extension = path.extname(filePath).replace('.', '');
      const sizeFormatted = formatSizeInMB(fileSize);

      return (
        '```' +
        extension +
        '\n' +
        `// ${filePath}\n` +
        `// [BINARY FILE] - Size: ${sizeFormatted}\n` +
        '```\n\n'
      );
    }

    const content = fileBuffer.toString('utf-8');
    const lines = content.split('\n');

    const linesToShow = maxLines ? lines.slice(0, maxLines) : lines;
    let contentToShow = linesToShow.join('\n');

    if (showLineNumbers) {
      contentToShow = addLineNumbers(linesToShow.join('\n'), 1);
    }

    const extension = path.extname(filePath).replace('.', '');
    const maxBackticks = findMaxConsecutiveBackticks(content);
    const wrapper = '`'.repeat(Math.max(5, maxBackticks + 1));

    const truncation =
      maxLines && lines.length > maxLines
        ? `\n// ... (${lines.length - maxLines} more lines truncated)`
        : '';

    return (
      wrapper +
      extension +
      '\n' +
      `// ${filePath}\n\n` +
      contentToShow +
      truncation +
      '\n' +
      wrapper +
      '\n\n'
    );
  } catch (e) {
    console.error(`Error reading file ${filePath}:`, e);
    return '';
  }
}

/**
 * Find the maximum number of consecutive backticks in a string
 */
export const findMaxConsecutiveBackticks = (str: string): number => {
  const matches = str.match(/`+/g);
  if (!matches) return 0;
  return Math.max(...matches.map((m) => m.length));
};
