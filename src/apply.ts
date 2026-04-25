import { writeFile, mkdir, stat, readFile } from 'fs/promises';
import path from 'path';

export interface ParsedFile {
  filePath: string;
  content: string;
  isBinary: boolean;
}

/**
 * Parse a document containing code blocks and extract file paths and contents
 * Handles varying numbers of backticks and ignores "noise" between blocks
 */
export const parseCodeBlocks = (input: string): ParsedFile[] => {
  const files: ParsedFile[] = [];
  const lines = input.split('\n');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Check if this line is a code block opening (3+ backticks followed by optional extension)
    const backtickMatch = line.match(/^(`{3,})(\S*)\s*$/);

    if (backtickMatch) {
      const numBackticks = backtickMatch[1].length;

      //
      const closingLine = '`'.repeat(numBackticks);

      //
      let j = i + 1;
      while (j < lines.length && lines[j].trim() !== closingLine) {
        j++;
      }

      if (j < lines.length) {
        // found closing!! - extract content between opening and closing
        const contentLines = lines.slice(i + 1, j);

        // First line should be file path comment
        // For example: `// src/some/thinghs.java`
        if (contentLines.length > 0) {
          const firstLine = contentLines[0].trim();
          if (firstLine.startsWith('// ')) {
            const filePath = firstLine.slice(3).trim();
            // Content is everything after the first line
            const content = contentLines.slice(1).join('\n');

            // it's a binary file marker? I known't
            const isBinary = content.includes('[BINARY FILE]');

            files.push({ filePath, content, isBinary });
          }
        }

        i = j + 1;
        continue;
      }
    }

    i++;
  }

  return files;
};

export interface ApplyResult {
  created: string[];
  updated: string[];
  skipped: string[];
}

/**
 * Apply parsed files
 */
export const applyFiles = async (
  files: ParsedFile[],
  baseDir?: string,
): Promise<ApplyResult> => {
  const created: string[] = [];
  const updated: string[] = [];
  const skipped: string[] = [];

  for (const file of files) {
    const fullPath = baseDir
      ? path.join(baseDir, file.filePath)
      : file.filePath;
    const dir = path.dirname(fullPath);

    if (file.isBinary) {
      // is binary file, skip then
      skipped.push(fullPath);
      continue;
    }

    // if it doesn't exist:
    await mkdir(dir, { recursive: true });

    let fileExists = false;
    try {
      await stat(fullPath);
      fileExists = true;
    } catch {
      // File doesn't exist
    }

    await writeFile(fullPath, file.content, 'utf-8');

    if (fileExists) {
      updated.push(fullPath);
    } else {
      created.push(fullPath);
    }
  }

  return { created, updated, skipped };
};

/**
 *
 */
export const applyFromFile = async (
  inputPath: string,
  baseDir?: string,
): Promise<ApplyResult & { parsed: ParsedFile[] }> => {
  const content = await readFile(inputPath, 'utf-8');
  const parsed = parseCodeBlocks(content);
  const result = await applyFiles(parsed, baseDir);

  return { ...result, parsed };
};
