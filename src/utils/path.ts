import path from 'path';

/**
 * Normalize to POSIX paths (for Windows issues)
 */
export const toPosix = (route: string) =>
  route.replace(new RegExp(path.sep, 'g'), path.posix.sep);
