import { Command } from 'commander';
import { version } from '../package.json';
import { readFile, stat } from 'fs/promises';
import glob from 'fast-glob';
import path from 'path';
import clipboard from 'clipboardy';
import ignore from 'ignore';
import { isBinaryFile } from './utils/binary';
import { addLineNumbers, formatSizeInMB } from './utils/pipes';
import { findGitignoreFiles, loadGitignoreRules } from './utils/gitignore';
import { applyFromFile } from './apply';

interface Options {
  content?: boolean;
  absolute?: boolean;
  copy?: boolean;
  maxLines?: number;
  lineNumbers?: boolean;
  gitignore?: boolean;
}

export const main = async () => {
  const program = new Command();

  program
    .name('stdin-glob')
    .description('Expand glob patterns and output file contents and paths')
    .version(version)
    .option(
      '--no-content',
      'Do not show file contents, only list matching paths',
    )
    .option('--absolute', 'Show the absolute path for entries', false)
    .option(
      '-c, --copy',
      'Copy the output to clipboard instead of printing to console',
      false,
    )
    .option(
      '-m, --max-lines <int>',
      'Show a limited number of lines in the file. If you not provide a number of lines it will show the full file content.',
      (value) => {
        if (isNaN(parseInt(value))) throw new Error('Lines must be a number');
        return parseInt(value);
      },
    )
    .option(
      '-n, --line-numbers',
      'Show line numbers next to each line, like in IDE sidebars',
      false,
    )
    .option(
      '--no-gitignore',
      'Disable .gitignore filtering (include files that would normally be ignored)',
    )
    .argument('[patterns...]', 'Glob patterns to match files')
    .action(async (patterns: string[], options: Options) => {
      if (patterns.length === 0) {
        console.error('Error: No patterns provided.');
        process.exit(1);
      }

      // Expand glob
      let files = await glob(patterns, {
        onlyFiles: true,
        dot: true,
        absolute: false,
      });

      if (files.length === 0) {
        console.error('No files matched the given patterns.');
        process.exit(1);
      }

      // Apply gitignore filtering if not disabled
      if (options.gitignore) {
        files = await filterByGitignore(files);

        if (files.length === 0) {
          console.error('No files remained after applying .gitignore rules.');
          process.exit(1);
        }
      }

      let output = '';

      for (const file of files) {
        if (options.content) {
          const fileOutput = await getFileContent(
            options.absolute ? path.join(process.cwd(), file) : file,
            options.maxLines ?? undefined,
            options.lineNumbers ?? false,
          );
          output += fileOutput;
        } else {
          output += file + '\n';
        }
      }

      if (options.copy) {
        try {
          await clipboard.write(output.trim());
          console.log('-> Output copied to clipboard successfully!');
        } catch (error) {
          console.error('-X Error copying to clipboard:', error);
          process.exit(1);
        }
      } else {
        console.log(output.trim());
      }
    });

  // Apply subcommand
  program
    .command('apply')
    .description(
      'Apply code blocks from a file to create/update files (inverse operation)',
    )
    .argument('<input-file>', 'File containing code blocks in markdown format')
    .option(
      '-d, --dir <path>',
      'Base directory to apply files (default: current directory)',
    )
    .action(
      async (
        inputFile: string,
        options: { dir?: string; dryRun?: boolean },
      ) => {
        try {
          const { parseCodeBlocks } = await import('./apply');
          const content = await readFile(inputFile, 'utf-8');
          const parsed = parseCodeBlocks(content);

          if (parsed.length === 0) {
            console.error('No valid code blocks found in the input file.');
            process.exit(1);
          }

          console.log(`Found ${parsed.length} file(s) to process:\n`);

          for (const file of parsed) {
            const status = file.isBinary ? '[SKIP - binary]' : '[OK]';
            console.log(`  ${status} ${file.filePath}`);
          }

          if (options.dryRun) {
            console.log('\n[Dry run] No files were modified.');
            return;
          }

          const result = await applyFromFile(inputFile, options.dir);

          console.log('\nResults:');
          if (result.created.length > 0) {
            console.log(`  Created: ${result.created.length}`);
            result.created.forEach((f) => console.log(`    + ${f}`));
          }
          if (result.updated.length > 0) {
            console.log(`  Updated: ${result.updated.length}`);
            result.updated.forEach((f) => console.log(`    ~ ${f}`));
          }
          if (result.skipped.length > 0) {
            console.log(`  Skipped (binary): ${result.skipped.length}`);
            result.skipped.forEach((f) => console.log(`    - ${f}`));
          }
        } catch (error) {
          console.error('Error:', error);
          process.exit(1);
        }
      },
    );

  await program.parseAsync(process.argv);
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

/**
 * Find the maximum number of consecutive backticks in a string
 */
export const findMaxConsecutiveBackticks = (str: string): number => {
  const matches = str.match(/`+/g);
  if (!matches) return 0;
  return Math.max(...matches.map((m) => m.length));
};

/**
 * Get file content with markdown format
 * @param filePath - The path to the file
 * @param maxLines - The number of lines to show. If you not provide a number of lines it will show the full file content.
 * @param showLineNumbers - Whether to show line numbers
 * @returns The file content with markdown format
 */
export const getFileContent = async (
  filePath: string,
  maxLines?: number,
  showLineNumbers?: boolean,
): Promise<string> => {
  try {
    const fileBuffer = await readFile(filePath);

    if (isBinaryFile(fileBuffer)) {
      // is binary!! not show content
      const stats = await stat(filePath);
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

    // is text file!! proceed with normal processing
    const content = fileBuffer.toString('utf-8');
    const lines = content.split('\n');

    // maxLines if exists
    const linesToShow = maxLines ? lines.slice(0, maxLines) : lines;
    let contentToShow = linesToShow.join('\n');

    if (showLineNumbers)
      contentToShow = addLineNumbers(linesToShow.join('\n'), 1);

    const extension = path.extname(filePath).replace('.', '');
    const maxBackticks = findMaxConsecutiveBackticks(content);
    const wrapper = '`'.repeat(Math.max(3, maxBackticks + 1));

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
};
