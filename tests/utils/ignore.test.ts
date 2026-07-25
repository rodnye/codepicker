import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFile } from 'fs/promises';
import glob from 'fast-glob';
import { findIgnoreFiles, loadIgnoreRules } from '../../src/utils/ignore';

vi.mock('fs/promises');
vi.mock('fast-glob', () => ({ default: vi.fn() }));

describe('findIgnoreFiles', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('finds ignore files', async () => {
    const mockGlob = vi.mocked(glob);
    mockGlob.mockResolvedValue(['.gitignore', 'src/.gitignore']);

    const files = await findIgnoreFiles('.gitignore');
    expect(files).toEqual(['.gitignore', 'src/.gitignore']);
  });

  it('returns empty array on error', async () => {
    const mockGlob = vi.mocked(glob);
    mockGlob.mockRejectedValue(new Error('Failed'));

    const files = await findIgnoreFiles('.gitignore');
    expect(files).toEqual([]);
  });
});

describe('loadIgnoreRules', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('loads rules from ignore files', async () => {
    vi.mocked(readFile)
      .mockResolvedValueOnce('node_modules\ndist\n!keep.js')
      .mockResolvedValueOnce('*.log\ncache/');

    const rules = await loadIgnoreRules(['.gitignore', 'src/.gitignore']);

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

    const rules = await loadIgnoreRules(['.gitignore']);

    expect(rules).toEqual(['node_modules', '*.js']);
  });

  it('continues on file read error', async () => {
    vi.mocked(readFile)
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce('*.log');

    const rules = await loadIgnoreRules(['.gitignore', 'src/.gitignore']);

    expect(rules).toEqual(['src/*.log']);
  });

  it('handles negated patterns correctly', async () => {
    vi.mocked(readFile).mockResolvedValue('!important.js');

    const rules = await loadIgnoreRules(['src/.gitignore']);

    expect(rules).toEqual(['!src/important.js']);
  });
});
