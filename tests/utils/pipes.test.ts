import { describe, it, expect } from 'vitest';
import { addLineNumbers, formatSizeInMB } from '../../src/utils/pipes';

describe('addLineNumbers', () => {
  it('adds line numbers to content', () => {
    const content = 'line1\nline2\nline3';
    const result = addLineNumbers(content);
    expect(result).toBe('1 | line1\n2 | line2\n3 | line3');
  });

  it('handles empty content', () => {
    expect(addLineNumbers('')).toBe('1 | ');
  });

  it('respects custom start line', () => {
    const content = 'line1\nline2';
    const result = addLineNumbers(content, 5);
    expect(result).toBe('5 | line1\n6 | line2');
  });

  it('pads numbers correctly', () => {
    const content = Array(100).fill('line').join('\n');
    const result = addLineNumbers(content);
    expect(result).toContain(' 99 | line');
    expect(result).toContain('100 | line');
  });
});

describe('formatSizeInMB', () => {
  it('formats bytes to MB', () => {
    expect(formatSizeInMB(0)).toBe('0.000 MB');
    expect(formatSizeInMB(1024 * 1024)).toBe('1.000 MB');
    expect(formatSizeInMB(1024 * 1024 * 2.5)).toBe('2.500 MB');
  });

  it('handles small files', () => {
    expect(formatSizeInMB(1024)).toBe('0.001 MB');
    expect(formatSizeInMB(512)).toBe('0.000 MB');
  });

  it('handles large files', () => {
    expect(formatSizeInMB(1024 * 1024 * 100)).toBe('100.000 MB');
  });
});
