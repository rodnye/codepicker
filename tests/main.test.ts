import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFile, stat } from 'fs/promises';
import { isBinaryFile } from '../src/utils/binary';
import { addLineNumbers, formatSizeInMB } from '../src/utils/pipes';
import { findGitignoreFiles, loadGitignoreRules } from '../src/utils/gitignore';
import {
  filterByGitignore,
  findMaxConsecutiveBackticks,
  getFileContent,
  main,
} from '../src/main';

vi.mock('fs/promises');
vi.mock('fast-glob', () => ({ default: async () => [] }));
vi.mock('clipboardy');
vi.mock('../src/utils/binary');
vi.mock('../src/utils/pipes');
vi.mock('../src/utils/gitignore');

describe('filterByGitignore', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  //
  it('returns all files when no gitignore files found', async () => {
    vi.mocked(findGitignoreFiles).mockResolvedValue([]);
    const files = ['file1.ts', 'file2.ts'];
    const result = await filterByGitignore(files);
    expect(result).toEqual(files);
  });

  //
  it('filters files based on gitignore rules', async () => {
    vi.mocked(findGitignoreFiles).mockResolvedValue(['.gitignore']);
    vi.mocked(loadGitignoreRules).mockResolvedValue(['node_modules']);

    const mockIg = { ignores: vi.fn().mockReturnValue(true) };
    vi.doMock('ignore', () => () => mockIg);

    const files = ['src/index.ts', 'node_modules/test.js'];
    const result = await filterByGitignore(files);
    expect(result).toHaveLength(1);
  });

  //
  it('returns all files when gitignore processing fails', async () => {
    vi.mocked(findGitignoreFiles).mockRejectedValue(new Error('Failed'));
    const files = ['file1.ts'];
    const result = await filterByGitignore(files);
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
    const result = await getFileContent('test.txt');
    expect(result).toBe('');
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
  it('exits with error when no patterns provided', async () => {
    vi.mocked(findGitignoreFiles).mockResolvedValue([]);
    const mockExit = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});
    await main();

    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
    mockError.mockRestore();
  });

  it('exits with error when no files matched', async () => {
    vi.mocked(findGitignoreFiles).mockResolvedValue([]);
    const mockExit = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});
    await main();

    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
    mockError.mockRestore();
  });
});
