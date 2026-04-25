# codepicker

> **Stop copying and pasting files one by one into ChatGPT.**

```bash
# 1. Grab your entire backend context to your clipboard in one command
codepicker "src/**/*.ts" -c

# 2. Paste into your LLM. When it replies, save the response to a file.

# 3. Apply the LLM's code directly back to your filesystem
codepicker apply response.md
```

---

[![npm version](https://img.shields.io/npm/v/codepicker-tool.svg)](https://www.npmjs.com/package/codepicker-tool)
[![npm license](https://img.shields.io/npm/l/codepicker-tool.svg)](https://www.npmjs.com/package/codepicker-tool)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org)  
[![GitHub stars](https://img.shields.io/github/stars/rodnye/codepicker-tool.svg)](https://github.com/rodnye/codepicker-tool)

A bidirectional CLI tool that turns your filesystem into structured Markdown and back again. It is designed to bridge the gap between your codebase and chat with Large Language Models (LLMs), making it effortless to gather project context or restore generated code.

## Why?

Working with LLMs on existing codebases involves a tedious loop: opening files, copying paths, copying content, pasting, and then manually recreating the LLM's response back into your project. Integrated agents in IDEs and the terminal simplify the process, but we don't always have access to them, or sometimes using traditional chat interfaces allows more flexibility in prompt editing and context persistence.

`codepicker` automates this entirely:

1. **Extract:** It grabs multiple files via glob patterns, wraps them cleanly in Markdown, and copies them to your clipboard in one command.
2. **Apply (Inverse):** When an LLM returns modified code inside a Markdown file, `codepicker apply` parses it, ignores the conversational "noise", and perfectly recreates or updates the files on your disk.
3. **Snapshot:** It creates safe, human-readable code snapshots with zero risk of accidental modification. Unlike copy-pasting or drag-and-drop, there's no chance of overwriting files or losing context. Just a clean Markdown backup you can version, share, or archive.

## Features

- **Instant LLM Context**: Copy entire project structures to your clipboard instantly with `--copy` or `-c`.
- **Bidirectional Workflow**: The `apply` command reverses the process, turning Markdown back into files.
- **Noise Tolerance**: `apply` ignores explanatory text outside of code blocks.
- **Smart Code Blocks**: Dynamically wraps content in the correct number of backticks to prevent Markdown breaking.
- **Precision Controls**: Limit lines (`-l`), add line numbers (`-n`), or get absolute paths (`-a`).
- **Binary Safety**: Detects binary files and outputs metadata instead of garbage characters.
- **.gitignore Aware**: Respects your ignore rules by default (disable with `-I`).

## Installation

```bash
npm install -g codepicker-tool
```

You can run this command from your terminal:

```bash
codepicker --version

# or

codep --version
```

> `codep` is just a shorter alias for `codepicker`.

## Usage

### 1. Gathering Context (Read)

```bash
codepicker [options] [patterns...]
```

#### Options

| Option                  | Description                                                              |
| ----------------------- | ------------------------------------------------------------------------ |
| `-c, --clipboard`            | Copy the output directly to your clipboard instead of printing to stdout |
| `-I, --include-ignored` | Include files that are normally matched by .gitignore rules              |
| `-l, --lines <n>`       | Limit output to the first `n` lines per file                             |
| `-p, --paths`           | Output only matching file paths (no content)                             |
| `-a, --absolute`        | Show absolute paths instead of relative paths                            |
| `-n, --line-numbers`    | Prefix lines with their line numbers (like an IDE sidebar)               |
| `-V, --version`         | Output the version number                                                |
| `-h, --help`            | Display help information                                                 |

### 2. Applying Context (Write)

The `apply` subcommand reads a Markdown file, finds code blocks formatted by `codepicker` (or an LLM), and writes them to disk.

```bash
codepicker apply <dump-file> [options]
```

#### Apply Options

| Option             | Description                                             |
| ------------------ | ------------------------------------------------------- |
| `<input-file>`     | The Markdown file containing code blocks                |
| `-d, --dir <path>` | Base directory to write files to (default: current dir) |
| `--dry-run`        | Preview what would be done without making changes       |

## Pattern Syntax

This tool uses [fast-glob](https://github.com/mrmlnc/fast-glob) for pattern matching. For detailed information about available globbing features (like negation `!`, globstars `**`, etc.), refer to the [picomatch documentation](https://github.com/micromatch/picomatch?tab=readme-ov-file#globbing-features).

## Examples

### The Standard LLM Workflow

This is what `codepicker` was built for.

**1. Grab context and copy to clipboard:**

```bash
codepicker "src/services/*.ts" "src/views/**/*.tsx" -c
```

_(Your clipboard now contains perfectly formatted Markdown. Paste it directly into ChatGPT/Claude)._

**2. Save the LLM's response:**
Save the response you get back to a file, e.g., `response.md`.

**3. Preview changes:**

```bash
codepicker apply response.md --dry-run
```

**4. Apply to your project:**

```bash
codepicker apply response.md
```

### Backups & Clipboard

By default, `codepicker` prints to stdout, which is incredibly useful for creating lightweight, human-readable text backups of your source code using standard shell redirection:

```bash
codepicker "src/**/*" > backup.md
# (You can restore this later with: codepicker apply backup.md)
```

You can add `-c` to copy the output straight to your clipboard instead.

```bash
codepicker "src/utils/*.js" -c
# ✔ Copied to clipboard successfully!
```

> ![warning]
> **But...** don't mix them! If you run `codepicker "src/**/*.js" -c > backup.md`, your `backup.md` file will only contain the success message (`✔ Copied to clipboard successfully!`), not your actual code. Omit `-c` when you want to save to a file.

### Limiting Output & Line Numbers

When you only need a summary or header context, limit the lines per file and add line numbers:

```bash
codepicker "src/**/*.ts" -l 5 -n
```

Output:

````
```ts
// src/index.ts

 1 | import { Command } from 'commander';
 2 | import { version } from '../package.json';
 3 | import { readFile } from 'fs/promises';
 4 | import glob from 'fast-glob';
 5 | import path from 'path';
// ... (23 more lines truncated)
```
````

### Listing Paths Only

Need to feed file paths into another tool (like `xargs` or `grep`)? Use `-p`:

```bash
codepicker "src/**/*.ts" -p -a
```

```
/home/user/project/src/index.ts
/home/user/project/src/utils/helpers.ts
```

### Handling Noisy LLM Outputs

The `apply` command is specifically designed to handle real-world LLM responses. It will safely ignore conversational text and only extract valid code blocks.

If an LLM returns this:

````markdown
Sure! Here is the updated logic. I also added a helper function.

```ts
// src/index.ts
const x = 10;
```

I hope this helps! Let me know if you need the helper.
````

Running `codepicker apply response.md` will successfully create `src/index.ts` with `const x = 10;`, ignoring everything else.

### Binary Files

Binary files are safely detected and converted to metadata comments, preventing terminal spam:

````
```png
// assets/logo.png
// [BINARY FILE] - Size: 0.024 MB
```
````

### Including Ignored Files

By default, `.gitignore` rules are respected. If you explicitly need to grab build artifacts or dependencies:

```bash
codepicker "dist/**/*.js" -I
```

## License

MIT
