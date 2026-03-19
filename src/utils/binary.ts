/**
 * Check if a file is binary
 * @see https://gist.github.com/magnetikonline/7a21ec5f5bcdbf7adb92f9d617e6198f
 */
export const isBinaryFile = (buffer: Buffer): boolean => {
  // check for null bytes or control characters that indicate binary
  for (let i = 0; i < Math.min(buffer.length, 512); i++) {
    const byte = buffer[i];
    // Null byte or control character
    if (byte === 0 || (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13)) {
      return true;
    }
  }
  return false;
};
