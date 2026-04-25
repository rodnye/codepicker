import { describe, it, expect, vi, beforeEach } from 'vitest';
import { writeFile, mkdir, stat, readFile } from 'fs/promises';
import { parseCodeBlocks, applyFiles, applyFromFile } from './apply';

vi.mock('fs/promises');

describe('parseCodeBlocks', () => {
  const bt = (n: number) => '`'.repeat(n);

  it('parses basic code blocks', () => {
    const input = `${bt(3)}ts\n// src/index.ts\nconsole.log('hello');\n${bt(3)}`;

    const files = parseCodeBlocks(input);
    expect(files).toHaveLength(1);
    expect(files[0].filePath).toBe('src/index.ts');
    expect(files[0].content).toBe("console.log('hello');");
    expect(files[0].isBinary).toBe(false);
  });

  it('handles noise between blocks', () => {
    const input = `Some noise here bla bla bla
${bt(3)}txt
// file1.txt
content1
${bt(3)}
More noise and random text, jojojo
${bt(3)}js
// file2.js
content2
${bt(3)}
Even more noise and webos`;

    const files = parseCodeBlocks(input);
    expect(files).toHaveLength(2);
    expect(files[0].filePath).toBe('file1.txt');
    expect(files[0].content).toBe('content1');
    expect(files[1].filePath).toBe('file2.js');
    expect(files[1].content).toBe('content2');
  });

  it('handles different numbers of backticks', () => {
    const input = `${bt(3)}ts\n// file1.ts\ncontent1\n${bt(3)}
${bt(4)}js\n// file2.js\ncontent2 with ${bt(3)}backticks${bt(3)} inside\n${bt(4)}
${bt(5)}py\n// file3.py\ncontent3\n${bt(5)}`;

    const files = parseCodeBlocks(input);
    expect(files).toHaveLength(3);
    expect(files[0].filePath).toBe('file1.ts');
    expect(files[1].filePath).toBe('file2.js');
    expect(files[1].content).toBe('content2 with ```backticks``` inside');
    expect(files[2].filePath).toBe('file3.py');
  });

  it('requires matching backtick counts for opening and closing', () => {
    const input = `${bt(4)}ts\n// file.ts\ncontent\n${bt(3)}`;

    const files = parseCodeBlocks(input);
    expect(files).toHaveLength(0);
  });

  it('does not confuse shorter backtick sequence as closing for longer opening', () => {
    const input = `${bt(5)}md
// readme.md
Here is some ${bt(3)}code${bt(3)}
And more ${bt(4)}more code${bt(4)}
 ${bt(5)}`;

    const files = parseCodeBlocks(input);
    expect(files).toHaveLength(1);
    expect(files[0].content).toBe(
      'Here is some ```code```\nAnd more ````more code````',
    );
  });

  it('identifies binary files', () => {
    const input = `${bt(3)}png\n// image.png\n// [BINARY FILE] - Size: 1.000 MB\n${bt(3)}`;

    const files = parseCodeBlocks(input);
    expect(files).toHaveLength(1);
    expect(files[0].isBinary).toBe(true);
  });

  it('identifies truncated files', () => {
    const input = `${bt(3)}ts\n// file.ts\ncontent\n// ... (100 more lines truncated)\n${bt(3)}`;

    const files = parseCodeBlocks(input);
    expect(files).toHaveLength(1);
  });

  it('handles empty content after file path', () => {
    const input = `${bt(3)}ts\n// empty.ts\n${bt(3)}`;

    const files = parseCodeBlocks(input);
    expect(files).toHaveLength(1);
    expect(files[0].content).toBe('');
  });

  it('ignores blocks without file path comment', () => {
    const input = `${bt(3)}ts\njust code without path\n${bt(3)}`;

    const files = parseCodeBlocks(input);
    expect(files).toHaveLength(0);
  });

  it('ignores blocks where first line does not start with //', () => {
    const input = `${bt(3)}ts\nsrc/index.ts\nconsole.log('hello');\n${bt(3)}`;

    const files = parseCodeBlocks(input);
    expect(files).toHaveLength(0);
  });

  it('handles unclosed code blocks gracefully', () => {
    const input = `${bt(3)}ts\n// file.ts\ncontent without closing`;

    const files = parseCodeBlocks(input);
    expect(files).toHaveLength(0);
  });

  it('handles multiline content correctly', () => {
    const input = `${bt(3)}ts
// src/main.ts
import { foo } from './bar';

const x = 1;
const y = 2;

export function add(): number {
  return x + y;
}
 ${bt(3)}`;

    const files = parseCodeBlocks(input);
    expect(files).toHaveLength(1);
    const expectedContent = `import { foo } from './bar';

const x = 1;
const y = 2;

export function add(): number {
  return x + y;
}`;
    expect(files[0].content).toBe(expectedContent);
  });

  it('handles file paths with spaces', () => {
    const input = `${bt(3)}txt\n// path with spaces/file name.txt\ncontent\n${bt(3)}`;

    const files = parseCodeBlocks(input);
    expect(files[0].filePath).toBe('path with spaces/file name.txt');
  });

  it('handles extension without content on same line', () => {
    const input = `${bt(3)}js\n// app.js\nconsole.log('test');\n${bt(3)}`;

    const files = parseCodeBlocks(input);
    expect(files).toHaveLength(1);
  });

  it('handles no extension (just backticks)', () => {
    const input = `${bt(3)}\n// Makefile\nall:\n\techo hello\n${bt(3)}`;

    const files = parseCodeBlocks(input);
    expect(files).toHaveLength(1);
    expect(files[0].filePath).toBe('Makefile');
    expect(files[0].content).toBe('all:\n\techo hello');
  });

  it('handles consecutive code blocks without noise', () => {
    const input = `${bt(3)}a\n// file1.a\ncontent1\n${bt(3)}
${bt(3)}b\n// file2.b\ncontent2\n${bt(3)}
${bt(3)}c\n// file3.c\ncontent3\n${bt(3)}`;

    const files = parseCodeBlocks(input);
    expect(files).toHaveLength(3);
  });

  it('example from the requirements', () => {
    const input = `Aqui hay texto de ruido entre cada bloque de contenido
${bt(3)}perl
// src/webo.perl
aqui hay contenido
${bt(3)}
Aqui hay texto de ruido entre cada bloque de contenido
${bt(3)}txt
// src/ejemplo.txt
Aqui nuevamente contenido correcto
${bt(3)}`;

    const files = parseCodeBlocks(input);
    expect(files).toHaveLength(2);
    expect(files[0].filePath).toBe('src/webo.perl');
    expect(files[0].content).toBe('aqui hay contenido');
    expect(files[1].filePath).toBe('src/ejemplo.txt');
    expect(files[1].content).toBe('Aqui nuevamente contenido correcto');
  });
});

describe('applyFiles', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('creates new files', async () => {
    vi.mocked(stat).mockRejectedValue(new Error('Not found'));
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);

    const files = [
      {
        filePath: 'src/index.ts',
        content: 'console.log("hello");',
        isBinary: false,
        isTruncated: false,
      },
    ];

    const result = await applyFiles(files);

    expect(result.created).toHaveLength(1);
    expect(result.created[0]).toContain('src/index.ts');
    expect(result.updated).toHaveLength(0);
    expect(writeFile).toHaveBeenCalled();
  });

  it('updates existing files', async () => {
    vi.mocked(stat).mockResolvedValue({} as any);
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);

    const files = [
      {
        filePath: 'src/index.ts',
        content: 'console.log("updated");',
        isBinary: false,
        isTruncated: false,
      },
    ];

    const result = await applyFiles(files);

    expect(result.updated).toHaveLength(1);
    expect(result.created).toHaveLength(0);
  });

  it('skips binary files', async () => {
    const files = [
      {
        filePath: 'image.png',
        content: '// [BINARY FILE]',
        isBinary: true,
        isTruncated: false,
      },
    ];

    const result = await applyFiles(files);

    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0]).toContain('image.png');
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('tracks truncated files', async () => {
    vi.mocked(stat).mockRejectedValue(new Error('Not found'));
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);

    const files = [
      {
        filePath: 'large.ts',
        content: 'line1\n// ... (100 more lines truncated)',
        isBinary: false,
        isTruncated: true,
      },
    ];

    const result = await applyFiles(files);

    expect(result.created).toHaveLength(1);
  });

  it('respects baseDir option', async () => {
    vi.mocked(stat).mockRejectedValue(new Error('Not found'));
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);

    const files = [
      {
        filePath: 'src/index.ts',
        content: 'content',
        isBinary: false,
        isTruncated: false,
      },
    ];

    await applyFiles(files, '/custom/path');

    expect(mkdir).toHaveBeenCalledWith('/custom/path/src', { recursive: true });
    expect(writeFile).toHaveBeenCalledWith(
      '/custom/path/src/index.ts',
      'content',
      'utf-8',
    );
  });

  it('creates nested directories', async () => {
    vi.mocked(stat).mockRejectedValue(new Error('Not found'));
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);

    const files = [
      {
        filePath: 'src/deep/nested/file.ts',
        content: 'content',
        isBinary: false,
        isTruncated: false,
      },
    ];

    await applyFiles(files);

    expect(mkdir).toHaveBeenCalledWith('src/deep/nested', { recursive: true });
  });

  it('handles multiple files with mixed states', async () => {
    vi.mocked(stat)
      .mockRejectedValueOnce(new Error('Not found'))
      .mockResolvedValueOnce({} as any)
      .mockRejectedValueOnce(new Error('Not found'));
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);

    const files = [
      {
        filePath: 'new.ts',
        content: 'new',
        isBinary: false,
        isTruncated: false,
      },
      {
        filePath: 'existing.ts',
        content: 'updated',
        isBinary: false,
        isTruncated: false,
      },
      {
        filePath: 'image.png',
        content: '// [BINARY FILE]',
        isBinary: true,
        isTruncated: false,
      },
    ];

    const result = await applyFiles(files);

    expect(result.created).toHaveLength(1);
    expect(result.updated).toHaveLength(1);
    expect(result.skipped).toHaveLength(1);
  });
});

describe('applyFromFile', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('reads file and applies parsed content', async () => {
    const inputContent = '```ts\n// test.ts\nconsole.log("test");\n```';
    vi.mocked(readFile).mockResolvedValue(inputContent);
    vi.mocked(stat).mockRejectedValue(new Error('Not found'));
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);

    const result = await applyFromFile('input.md');

    expect(result.parsed).toHaveLength(1);
    expect(result.created).toHaveLength(1);
    expect(readFile).toHaveBeenCalledWith('input.md', 'utf-8');
  });

  it('passes baseDir to applyFiles', async () => {
    const inputContent = '```ts\n// test.ts\ncontent\n```';
    vi.mocked(readFile).mockResolvedValue(inputContent);
    vi.mocked(stat).mockRejectedValue(new Error('Not found'));
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);

    await applyFromFile('input.md', '/output');

    expect(mkdir).toHaveBeenCalledWith('/output', { recursive: true });
  });
});
