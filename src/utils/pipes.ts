/**
 * Add line numbers to content
 */
export const addLineNumbers = (
  content: string,
  startLine: number = 1,
): string => {
  const lines = content.split('\n');

  // calculate width of bar
  const paddingWidth = (startLine + lines.length - 1).toString().length;

  return lines
    .map((line, index) => {
      const lineNumber = startLine + index;
      const paddedNumber = lineNumber.toString().padStart(paddingWidth, ' ');
      return `${paddedNumber} | ${line}`;
    })
    .join('\n');
};

/**
 * Format file size in MB with 3 decimal places
 */
export const formatSizeInMB = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(3) + ' MB';
};
