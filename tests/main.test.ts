import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFile, stat } from 'fs/promises';
import glob from 'fast-glob';
import { isBinaryFile } from '../src/utils/binary';
import { addLineNumbers, formatSizeInMB } from '../src/utils/pipes';
import { filterByIgnoreFile } from '../src/utils/ignore';
import { findMaxConsecutiveBackticks, getFileContent } from '../src/pick';
import { main } from '../src/main';

vi.mock('fs/promises');
vi.mock('fast-glob', () => ({ default: vi.fn() }));
vi.mock('clipboardy', () => ({ default: { read: vi.fn(), write: vi.fn() } }));
vi.mock('../src/utils/binary');
vi.mock('../src/utils/pipes');

describe('filterByGitignore', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns all files when no gitignore files found', async () => {
    vi.mocked(glob).mockResolvedValue([]);
    const files = ['file1.ts', 'file2.ts'];
    const result = await filterByIgnoreFile(files, '.gitignore');
    expect(result).toEqual(files);
  });

  it('filters files based on gitignore rules', async () => {
    vi.mocked(glob).mockResolvedValue(['.gitignore']);
    vi.mocked(readFile).mockResolvedValue('node_modules');

    const files = ['src/index.ts', 'node_modules/test.js'];
    const result = await filterByIgnoreFile(files);
    expect(result).toEqual(['src/index.ts']);
  });

  it('returns all files when gitignore processing fails', async () => {
    vi.mocked(glob).mockRejectedValue(new Error('Failed'));
    const files = ['file1.ts'];
    const result = await filterByIgnoreFile(files);
    expect(result).toEqual(files);
  });
});

describe('findMaxConsecutiveBackticks', () => {
  it('returns 0 for string without backticks', () => {
    expect(findMaxConsecutiveBackticks('hello world')).toBe(0);
  });

  it('finds max consecutive backticks', () => {
    expect(findMaxConsecutiveBackticks('` ``` ````')).toBe(4);
  });

  it('handles multiple occurrences', () => {
    expect(findMaxConsecutiveBackticks('` ``` ` ``')).toBe(3);
  });
});

describe('getFileContent', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns empty string on file read error', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('Read error'));
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await getFileContent('test.txt');
    expect(result).toBe('');
    mockError.mockRestore();
  });

  it('handles binary files', async () => {
    vi.mocked(readFile).mockResolvedValue(Buffer.from([0x00, 0x01]));
    vi.mocked(isBinaryFile).mockReturnValue(true);
    vi.mocked(stat).mockResolvedValue({ size: 1024 } as any);
    vi.mocked(formatSizeInMB).mockReturnValue('0.001 MB');

    const result = await getFileContent('test.png');
    expect(result).toContain('[BINARY FILE]');
    expect(result).toContain('test.png');
  });

  it('processes text files correctly', async () => {
    const content = 'line1\nline2\nline3';
    vi.mocked(readFile).mockResolvedValue(Buffer.from(content));
    vi.mocked(isBinaryFile).mockReturnValue(false);

    const result = await getFileContent('test.txt');
    expect(result).toContain('test.txt');
    expect(result).toContain('line1');
    expect(result).toContain('line2');
  });

  it('respects maxLines parameter', async () => {
    const content = 'line1\nline2\nline3';
    vi.mocked(readFile).mockResolvedValue(Buffer.from(content));
    vi.mocked(isBinaryFile).mockReturnValue(false);

    const result = await getFileContent('test.txt', 2);
    expect(result).toContain('line1');
    expect(result).toContain('line2');
    expect(result).not.toContain('line3');
    expect(result).toContain('1 more lines truncated');
  });

  it('adds line numbers when requested', async () => {
    const content = 'line1\nline2';
    vi.mocked(readFile).mockResolvedValue(Buffer.from(content));
    vi.mocked(isBinaryFile).mockReturnValue(false);
    vi.mocked(addLineNumbers).mockReturnValue('1 | line1\n2 | line2');

    const result = await getFileContent('test.txt', undefined, true);
    expect(result).toContain('1 | line1');
    expect(result).toContain('2 | line2');
  });

  it('handles code blocks with backticks', async () => {
    const content = '```\ncode\n```';
    vi.mocked(readFile).mockResolvedValue(Buffer.from(content));
    vi.mocked(isBinaryFile).mockReturnValue(false);

    const result = await getFileContent('test.js');
    expect(result).toContain('````js');
  });
});

describe('CLI Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.exitCode = 0;
  });

  it('exits with error when no patterns provided', async () => {
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});

    process.argv = ['node', 'codepicker'];
    await main();

    expect(process.exitCode).toBe(1);
    expect(mockError).toHaveBeenCalledWith(
      '✖ Error:',
      'Provide at least one glob pattern.',
    );

    mockError.mockRestore();
  });

  it('exits with error when no files matched', async () => {
    vi.mocked(glob).mockResolvedValue([]);
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});

    process.argv = ['node', 'codepicker', '**/*.ts'];
    await main();

    expect(process.exitCode).toBe(1);
    expect(mockError).toHaveBeenCalledWith(
      '✖ Error:',
      'No files matched the given patterns.',
    );

    mockError.mockRestore();
  });
});
