import { describe, it, expect } from 'vitest';
import { isBinaryFile } from './binary';

describe('isBinaryFile', () => {
  it('returns false for text content', () => {
    const buffer = Buffer.from('Hello world\nThis is text');
    expect(isBinaryFile(buffer)).toBe(false);
  });

  it('returns true for null bytes', () => {
    const buffer = Buffer.from([0x48, 0x00, 0x65, 0x6c, 0x6c, 0x6f]);
    expect(isBinaryFile(buffer)).toBe(true);
  });

  it('returns true for control characters', () => {
    const buffer = Buffer.from([0x01, 0x02, 0x03, 0x04]);
    expect(isBinaryFile(buffer)).toBe(true);
  });

  it('allows whitespace characters', () => {
    const buffer = Buffer.from('Hello\tworld\nnew line\rreturn');
    expect(isBinaryFile(buffer)).toBe(false);
  });

  it('only checks first 512 bytes', () => {
    const buffer = Buffer.alloc(1000);
    buffer.fill(0x41); // 'A'
    buffer[500] = 0x00; // null byte within first 512
    expect(isBinaryFile(buffer)).toBe(true);

    const buffer2 = Buffer.alloc(1000);
    buffer2.fill(0x41);
    buffer2[600] = 0x00; // null byte after first 512
    expect(isBinaryFile(buffer2)).toBe(false);
  });
});
