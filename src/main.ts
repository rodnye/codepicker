import { Command } from 'commander';
import { version } from '../package.json';
import clipboard from 'clipboardy';
import { pickFiles, PickOptions } from './pick';
import { applyFiles, parseCodeBlocks } from './apply';

export const main = async () => {
  const program = new Command();

  program
    .name('codepicker')
    .description(
      'Pick file contents into structured Markdown, or apply them back.',
    )
    .version(version);

  // Pick subcommand (default)
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
    .action(
      async (
        patterns: string[],
        options: {
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
        },
      ) => {
        try {
          const pickOptions: PickOptions = {
            patterns,
            absolute: options.absolute,
            lines: options.lines,
            includeLineNumbers: options.includeLineNumbers,
            includeDocs: options.includeDocs,
            gitignore: options.gitignore,
            codeignore: options.codeignore,
            dotIgnore: options.dotIgnore,
            defaultPatterns: options.defaultPatterns,
            remote: options.remote,
            remoteBranch: options.remoteBranch,
          };

          const output = await pickFiles(pickOptions);

          if (options.clipboard) {
            try {
              await clipboard.write(output);
              console.log('✔ Copied to clipboard successfully.');
            } catch (error) {
              throw new Error(`Error copying to clipboard: ${error}`);
            }
          } else {
            console.log(output);
          }
        } catch (error: any) {
          console.error('✖ Error:', error.message);
          process.exitCode = 1;
        }
      },
    );

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
            const { readFile } = await import('fs/promises');
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
