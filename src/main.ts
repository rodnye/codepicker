import { Command } from 'commander';
import { version } from '../package.json';
import { readFile, stat } from 'fs/promises';
import glob from 'fast-glob';
import path from 'path';
import clipboard from 'clipboardy';
import { isBinaryFile } from './utils/binary';
import { addLineNumbers, formatSizeInMB } from './utils/pipes';
import { filterByIgnoreFile, filterByIgnorePatterns } from './utils/ignore';
import { applyFiles, parseCodeBlocks } from './apply';
import { DEFAULTS_IGNORE_PATTERNS } from './consts';
import {
  checkGitInstalled,
  cloneRepository,
  cleanupTempDir,
} from './utils/git';

interface GatherOptions {
  paths?: boolean; // --paths
  absolute?: boolean; // -a, --absolute
  clipboard?: boolean; // -c, --clipboard
  lines?: number; // -l, --lines
  includeDocs?: boolean; // -D, --include-docs
  includeLineNumbers?: boolean; // --include-line-numbers
  gitignore?: boolean; // --no-gitignore
  codeignore?: boolean; // --no-codeignore
  dotIgnore?: boolean; // --no-dot-ignore
  defaultPatterns?: boolean; // --no-default-patterns
  remote?: string; // --remote
  remoteBranch?: string; // --remote-branch
}

export const main = async () => {
  const program = new Command();

  program
    .name('codepicker')
    .description(
      'Pick file contents into structured Markdown, or apply them back.',
    )
    .version(version);

  // Pick subcommand
  program
    .command('pick', { isDefault: true })
    .description('Pick defined files in glob patterns and print into Markdown.')
    .argument('[patterns...]', 'Glob patterns to match files')
    .option('--paths', 'Output only matching file paths, no content', false)
    .option(
      '-a, --absolute',
      'Show absolute paths instead of relative ones',
      false,
    )
    .option(
      '-c, --clipboard',
      'Copy the output to clipboard instead of stdout',
      false,
    )
    .option(
      '-l, --lines <number>',
      'Limit the number of lines per file',
      parseInt,
    )
    .option(
      '--include-line-numbers',
      'Prefix lines with their line numbers',
      false,
    )
    .option(
      '-D, --include-docs',
      'Append Codepick format documentation at the end of the output',
      false,
    )
    .option('--no-gitignore', "Don't use .gitignore rules", true)
    .option('--no-codeignore', "Don't use .codeignore rules", true)
    .option('--no-dot-ignore', "Don't use .ignore rules", true)
    .option(
      '--no-default-patterns',
      "Don't use default ignore patterns (node_modules, .git, etc...)",
      true,
    )
    .option('--remote <url>', 'Clone a remote repository and operate inside it')
    .option(
      '--remote-branch <branch>',
      'Branch, tag, or commit to checkout after cloning (default: default branch)',
    )
    .action(async (patterns: string[], options: GatherOptions) => {
      let tempDir: string | null = null;
      const originalCwd = process.cwd();

      try {
        // If --remote is specified, check Git and clone
        if (options.remote) {
          await checkGitInstalled();
          tempDir = await cloneRepository(options.remote, options.remoteBranch);
          process.chdir(tempDir);
        }

        if (patterns.length === 0) {
          throw new Error('Provide at least one glob pattern.');
        }

        // Expand glob
        let files = await glob(patterns, {
          onlyFiles: true,
          dot: true,
          absolute: false,
        });

        if (files.length === 0) {
          throw new Error('No files matched the given patterns.');
        }

        // Apply default filtering
        if (options.defaultPatterns) {
          files = filterByIgnorePatterns(files, DEFAULTS_IGNORE_PATTERNS);
          if (files.length === 0) {
            throw new Error(
              'No files remained after applying default codepicker rules.\n' +
                '  Try using --no-default-patterns to force including these files.',
            );
          }
        }

        // Apply .gitignore filtering
        if (options.gitignore) {
          files = await filterByIgnoreFile(files, '.gitignore');
          if (files.length === 0) {
            throw new Error(
              'No files remained after applying .gitignore rules.\n' +
                '  Try using --no-gitignore to force including these files.',
            );
          }
        }

        // Apply .ignore filtering
        if (options.dotIgnore) {
          files = await filterByIgnoreFile(files, '.ignore');
          if (files.length === 0) {
            throw new Error(
              'No files remained after applying .ignore rules.\n' +
                '  Try using --no-dot-ignore to force including these files.',
            );
          }
        }

        // Apply .codeignore filtering
        if (options.codeignore) {
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
          if (!options.paths) {
            const displayPath = options.absolute
              ? path.join(process.cwd(), file)
              : file;
            output += await getFileContent(
              displayPath,
              options.lines,
              options.includeLineNumbers,
            );
          } else {
            const displayPath = options.absolute
              ? path.join(process.cwd(), file)
              : file;
            output += displayPath + '\n';
          }
        }

        if (options.includeDocs) {
          const docPath = path.join(__dirname, '../CODEPICK_FORMAT.md');
          const docContent = await readFile(docPath, 'utf-8');
          output += '\n\n---\n\n';
          output += docContent;
        }

        if (options.clipboard) {
          try {
            await clipboard.write(output.trim());
            console.log('✔ Copied to clipboard successfully.');
          } catch (error) {
            throw new Error(`Error copying to clipboard: ${error}`);
          }
        } else {
          console.log(output.trim());
        }
      } catch (error: any) {
        console.error('✖ Error:', error.message);
        process.exitCode = 1;
      } finally {
        if (tempDir) {
          process.chdir(originalCwd);
          await cleanupTempDir(tempDir);
        }
      }
    });

  // Apply subcommand
  program
    .command('apply')
    .description(
      'Read a Markdown file and extract/write its code blocks to disk.',
    )
    .argument(
      '[dump-file]',
      'Markdown file containing code blocks (optional, reads from clipboard if use -c flag)',
    )
    .option(
      '-d, --dir <path>',
      'Base directory to write files to',
      process.cwd(),
    )
    .option('-c, --clipboard', 'Read code blocks from clipboard', false)
    .option('--dry-run', 'Preview changes without writing to disk', false)
    .action(
      async (
        inputFile: string | undefined,
        options: { dir: string; dryRun: boolean; clipboard: boolean },
      ) => {
        try {
          let content: string;

          if (options.clipboard) {
            try {
              content = await clipboard.read();
              if (!content || content.trim().length === 0) {
                throw new Error('Clipboard is empty.');
              }
            } catch (error) {
              throw new Error(`Error reading from clipboard: ${error}`);
            }
          } else {
            if (!inputFile) {
              throw new Error(
                'No input file provided. Use --clipboard if you want to use the clipboard.',
              );
            }
            content = await readFile(inputFile, 'utf-8');
          }

          const parsed = parseCodeBlocks(content);

          if (parsed.length === 0) {
            throw new Error('No valid code blocks found in the input.');
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

          const result = await applyFiles(parsed, options.dir);

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
            console.log(`  Skipped: ${result.skipped.length}`);
            result.skipped.forEach((f) =>
              console.log(`    - ${f.path}: ${f.cause}`),
            );
          }
        } catch (error: any) {
          console.error('✖ Error:', error.message);
          process.exitCode = 1;
        }
      },
    );

  await program.parseAsync(process.argv);
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
