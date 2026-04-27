> **Stop copying files into ChatGPT one by one...**

<div align="center">
  <img src="https://raw.githubusercontent.com/rodnye/codepicker/refs/heads/main/docs/logo.png" width="200">

  <h1>codepicker 👌</h1>
</div>

```bash
# 1. Grab your backend context in one command
codepicker "src/**/*.ts" -c

# 2. Paste into your LLM and copy the response

# 3. Apply it back to your project
codepicker apply -c
```

[![npm version](https://img.shields.io/npm/v/codepicker-tool.svg)](https://www.npmjs.com/package/codepicker-tool)
[![npm license](https://img.shields.io/npm/l/codepicker-tool.svg)](https://www.npmjs.com/package/codepicker-tool)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org)
[![GitHub stars](https://img.shields.io/github/stars/rodnye/codepicker.svg)](https://github.com/rodnye/codepicker)

---

## What?

`codepicker` is a **bidirectional CLI** that turns your codebase into structured Markdown—and back again!

It’s designed to make working with LLMs on real projects **fast and predictable**. Instead of juggling files manually, you move context in and out of your project with a couple of commands.

## Why?

Working with LLM chats on existing codebases usually looks like: open files, copy paths and content, paste into chat, repeat, manually reconstruct changes...

Even with IDE agents, you're often locked into their workflow.

## Okay, so then?

`codepicker` removes that loop entirely:

### 1. Extract your code

Pull multiple files using glob patterns and convert them into clean Markdown.

### 2. Ask

Paste into your LLM and iterate freely.

### 3. Apply

Take the response and reconstruct files automatically!

## It works?

Yes! ->

- No fragile copy-paste cycles
- Possibility to back up the code
- No dependency on IDE integrations
- Works with any LLM interface

To apply the response, a format called [`codepick`](./CODEPICK_FORMAT.md) is used. This is perfectly parsed, and —unlike diffs or other response formats— it packages the entire content of the file.

## Features

- **Instant context** → copy entire project slices with `-c`
- **Reverse workflow** → `apply` turns Markdown back into files
- **Noise-tolerant parsing** → ignores explanations, keeps only code
- **Smart Markdown wrapping** → prevents broken code blocks
- **Precision controls** → limit lines, add numbers, absolute paths (only for context)
- **Documentation mode (`-D`)** → helps LLMs follow the codepick format correctly
- **Binary-safe** → avoids dumping unreadable content
- **.gitignore aware** → respects your repo by default

---

## Installation

```bash
npm install -g codepicker-tool
```

```bash
codepicker --version
# or
codep --version
```

> `codep` is just a shorter alias for `codepicker`.

## Usage

### Read (extract context)

```bash
codepicker [options] [patterns...]
```

#### Options

| Option                  | Description                 |
| ----------------------- | --------------------------- |
| `-c, --clipboard`       | Copy output to clipboard    |
| `-D, --doc`             | Append format documentation |
| `-I, --include-ignored` | Include `.gitignore` files  |
| `-a, --absolute`        | Use absolute paths          |
| `-l, --lines <n>`       | Limit lines per file        |
| `-p, --paths`           | Output only file paths      |
| `-n, --line-numbers`    | Show line numbers           |
| `-V, --version`         | Show version                |
| `-h, --help`            | Help                        |

---

### Write (apply changes)

```bash
codepicker apply [dump-file] [options]
```

#### Options

| Option             | Description                    |
| ------------------ | ------------------------------ |
| `[dump-file]`      | Markdown file with code blocks |
| `-d, --dir <path>` | Target directory               |
| `-c, --clipboard`  | Read from clipboard            |
| `--dry-run`        | Preview changes                |

## Typical Workflow

### 1. Extract context

```bash
codep -Dc "src/services/*.ts" "src/views/**/*.tsx"
```

### 2. Ask your LLM

Paste and instruct:

```
Modify the view with a blue button and modern shadow.
IMPORTANT: Use Codepick format.
```

### 3. Apply result

```bash
codep apply -c
```

## Helping the LLM behave

Some models need guidance. Use:

```bash
codepicker "src/**/*.ts" -cD
```

The `-D` flag appends the full format spec so the model responds correctly.

## Backups

```bash
codepicker "src/**/*" > backup.md
```

Restore anytime:

```bash
codepicker apply backup.md
```

## Useful Patterns

### Limit output

```bash
codepicker "src/**/*.ts" -l 5 -n
```

### Listing Paths Only

Need to feed file paths into another tool (like `xargs` or `grep`)? Use `-p`:

```bash
codepicker "src/**/*.ts" -p -a
```

```
/home/user/project/src/index.ts
/home/user/project/src/utils/helpers.ts
```

### Include ignored files

```bash
codepicker "dist/**/*.js" -I
```

## Handling messy LLM responses

`apply` ignores everything outside code blocks.

If the response includes explanations, they’re safely discarded.

Only valid code is written.

## Binary files

Binary files are replaced with metadata instead of raw bytes:

````
```png
// assets/logo.png
// [BINARY FILE] - Size: 0.024 MB
```
````

## Pattern syntax

Uses `fast-glob`.

Supports:

- `**` (globstars)
- `!` (negation)
- advanced matching

More info:

- https://github.com/mrmlnc/fast-glob
- https://github.com/micromatch/picomatch

## License

MIT
