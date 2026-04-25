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

interface GatherOptions {
  paths?: boolean; // --paths
  absolute?: boolean; // -a, --absolute
  copy?: boolean; // -c, --copy, --clipboard
  lines?: number; // -l, --lines
  lineNumbers?: boolean; // -n, --line-numbers
  includeIgnored?: boolean; // -I, --include-ignored
}

export const main = async () => {
  const program = new Command();

  program
    .name('codepicker')
    .description(
      'Pick file contents into structured Markdown, or apply them back.',
    )
    .version(version)
    .argument('[patterns...]', 'Glob patterns to match files')
    .option('--paths', 'Output only matching file paths, no content', false)
    .option(
      '-a, --absolute',
      'Show absolute paths instead of relative ones',
      false,
    )
    .option(
      '-c, --copy, --clipboard',
      'Copy the output to clipboard instead of stdout',
      false,
    )
    .option(
      '-l, --lines <number>',
      'Limit the number of lines per file',
      parseInt,
    )
    .option('-n, --line-numbers', 'Prefix lines with their line numbers', false)
    .option(
      '-I, --include-ignored',
      'Include files matched by .gitignore rules',
      false,
    )
    .action(async (patterns: string[], options: GatherOptions) => {
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

      // Apply gitignore filtering by default (unless -I is passed)
      if (!options.includeIgnored) {
        files = await filterByGitignore(files);

        if (files.length === 0) {
          console.error('No files remained after applying .gitignore rules.');
          process.exit(1);
        }
      }

      let output = '';

      for (const file of files) {
        if (!options.paths) {
          const displayPath = options.absolute
            ? path.join(process.cwd(), file)
            : file;
          output += await getFileContent(
            displayPath,
            options.lines,
            options.lineNumbers,
          );
        } else {
          const displayPath = options.absolute
            ? path.join(process.cwd(), file)
            : file;
          output += displayPath + '\n';
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
      'Read a Markdown file and extract/write its code blocks to disk.',
    )
    .argument('<dump-file>', 'Markdown file containing code blocks')
    .option(
      '-d, --dir <path>',
      'Base directory to write files to',
      process.cwd(),
    )
    .option('--dry-run', 'Preview changes without writing to disk', false)
    .action(
      async (inputFile: string, options: { dir: string; dryRun: boolean }) => {
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
