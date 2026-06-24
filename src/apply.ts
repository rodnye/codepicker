import { writeFile, mkdir, stat } from 'fs/promises';
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
            let content = contentLines.slice(1).join('\n');

            if (content.indexOf('\n') === 0) content = content.slice(1);

            // it's a binary file marker? I known't
            const isBinary = content.includes('\n// [BINARY FILE]');

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
  skipped: { path: string; cause: string }[];
}

/**
 * Apply parsed files
 */
export const applyFiles = async (
  files: ParsedFile[],
  baseDir?: string,
): Promise<ApplyResult> => {
  const created: ApplyResult['created'] = [];
  const updated: ApplyResult['updated'] = [];
  const skipped: ApplyResult['skipped'] = [];

  const resolvedBase = path.resolve(baseDir || process.cwd());

  for (const file of files) {
    const fullPath = path.resolve(resolvedBase, file.filePath);

    // path Traversal Protection
    if (
      !fullPath.startsWith(resolvedBase + path.sep) &&
      fullPath !== resolvedBase
    ) {
      skipped.push({
        path: file.filePath,
        cause: 'path traversal blocked',
      });
      continue;
    }

    const dir = path.dirname(fullPath);

    if (file.isBinary) {
      skipped.push({ path: fullPath, cause: 'is binary' });
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
