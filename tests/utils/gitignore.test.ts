import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFile } from 'fs/promises';
import {
  findGitignoreFiles,
  loadGitignoreRules,
} from '../../src/utils/gitignore';
import glob from 'fast-glob';

vi.mock('fs/promises');
vi.mock('fast-glob');

describe('findGitignoreFiles', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('finds gitignore files', async () => {
    const mockGlob = vi.mocked(glob);
    mockGlob.mockResolvedValue(['.gitignore', 'src/.gitignore']);

    const files = await findGitignoreFiles();
    expect(files).toEqual(['.gitignore', 'src/.gitignore']);
  });

  it('returns empty array on error', async () => {
    const mockGlob = vi.mocked(glob);
    mockGlob.mockRejectedValue(new Error('Failed'));

    const files = await findGitignoreFiles();
    expect(files).toEqual([]);
  });
});

describe('loadGitignoreRules', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('loads rules from gitignore files', async () => {
    vi.mocked(readFile)
      .mockResolvedValueOnce('node_modules\ndist\n!keep.js')
      .mockResolvedValueOnce('*.log\ncache/');

    const rules = await loadGitignoreRules(['.gitignore', 'src/.gitignore']);

    expect(rules).toContain('node_modules');
    expect(rules).toContain('dist');
    expect(rules).toContain('!keep.js');
    expect(rules).toContain('src/*.log');
    expect(rules).toContain('src/cache/');
  });

  it('handles comments and empty lines', async () => {
    vi.mocked(readFile).mockResolvedValue(
      '# comment\n\nnode_modules\n# another\n*.js',
    );

    const rules = await loadGitignoreRules(['.gitignore']);

    expect(rules).toEqual(['node_modules', '*.js']);
  });

  it('continues on file read error', async () => {
    vi.mocked(readFile)
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce('*.log');

    const rules = await loadGitignoreRules(['.gitignore', 'src/.gitignore']);

    expect(rules).toEqual(['src/*.log']);
  });

  it('handles negated patterns correctly', async () => {
    vi.mocked(readFile).mockResolvedValue('!important.js');

    const rules = await loadGitignoreRules(['src/.gitignore']);

    expect(rules).toEqual(['!src/important.js']);
  });
});
