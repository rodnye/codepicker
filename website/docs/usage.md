---
sidebar_position: 4
title: Basic Usage
description: Learn how to extract and apply code with Codepicker.
---

# Basic Usage

Codepicker is divided into two main commands:

- `pick` (default) to extract context.
- `apply` to apply changes.

## Extracting Context (pick)

The `pick` command scans files matching the provided glob patterns and generates Markdown output with the content of each file.

```bash
codepicker pick "src/**/*.ts" "!src/**/*.test.ts"
```

If you don't specify `pick`, it's the default command:

```bash
codepicker "src/**/*.ts"
```

### Most Common Options

| Option                     | Description                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `-c, --clipboard`          | Copies the output to the clipboard instead of printing it to the console.                         |
| `-a, --absolute`           | Shows absolute paths instead of relative ones.                                                    |
| `-l, --lines <n>`          | Limits the number of lines per file.                                                              |
| `--include-line-numbers`   | Adds line numbers to the content.                                                                 |
| `-D, --include-docs`       | Includes the Codepick format documentation at the end of the output (useful for guiding the LLM). |
| `--no-gitignore`           | Ignores `.gitignore` rules.                                                                       |
| `--remote <url>`           | Clones a remote repository and extracts from there.                                               |
| `--remote-branch <branch>` | Specifies the branch, tag, or commit to use with `--remote`.                                      |

### Examples

1. Extract all TypeScript files from the `src` folder and copy them to the clipboard:

```bash
codepicker "src/**/*.ts" -c
```

2. Extract only files with less than 50 lines:

```bash
codepicker "src/**/*.js" -l 50
```

3. Extract from a remote repository:

```bash
codepicker "packages/**/*.md" --remote https://github.com/rodnye/codepicker --remote-branch main
```

## Applying Changes (apply)

The `apply` command reads a Markdown file (or the clipboard) containing code blocks in **Codepick format** and writes the files to disk.

```bash
codepicker apply file.md
```

### Options

| Option             | Description                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| `-c, --clipboard`  | Reads from the clipboard instead of a file.                               |
| `-d, --dir <path>` | Base directory where files will be written (defaults to the current one). |
| `--dry-run`        | Shows a preview of the changes without writing them.                      |

### Examples

1. Apply from the clipboard:

```bash
codepicker apply -c
```

2. Apply from a `response.md` file:

```bash
codepicker apply response.md
```

3. Preview without changes:

```bash
codepicker apply -c --dry-run
```

## Typical Workflow

1. **Extract context**:

```bash
codepicker "src/**.ts" "src/**.css" -c
```

2. **Paste into the LLM** and ask for modifications, indicating it should use the Codepick format.

3. **Apply the response**:

```bash
codepicker apply -c
```

## Codepick Format

Each file is represented as a code block with the path on the first line:

````txt
```ts
// src/index.ts
console.log('Hello world');
```
````
