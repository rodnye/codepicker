> **Stop copying files into ChatGPT one by one...**

<div align="center">
  <img src="https://raw.githubusercontent.com/rodnye/codepicker/refs/heads/main/website/static/logo.png" width="200">

  <h1>codepicker 👌🏻</h1>
</div>

```bash
# 1. Grab your backend context in one command
codepicker "src/**.ts" -c

# 2. Paste into your LLM and copy the response

# 3. Apply it back to your project
codepicker apply -c
```

[![npm version](https://img.shields.io/npm/v/codepicker-tool.svg?style=for-the-badge)](https://www.npmjs.com/package/codepicker-tool)
[![npm downloads](https://img.shields.io/npm/dm/codepicker-tool.svg?color=purple&style=for-the-badge&logo=npm)](https://www.npmjs.com/package/codepicker-tool)
[![GitHub stars](https://img.shields.io/github/stars/rodnye/codepicker.svg?style=for-the-badge&color=white&labelColor=black&logo=github)](https://github.com/rodnye/codepicker)
[![npm license](https://img.shields.io/npm/l/codepicker-tool.svg?style=for-the-badge)](https://www.npmjs.com/package/codepicker-tool)

---

## What?

`codepicker` is a **bidirectional CLI** that turns your codebase into structured Markdown—and back again!

It’s designed to make working with LLMs on real projects **fast and predictable**. Instead of juggling files manually, you move context in and out of your project with a couple of commands.

## Why?

Working with LLM chats on existing codebases usually looks like: open files, copy paths and content, paste into chat, repeat, manually reconstruct changes...

Even with IDE agents, you're often locked into their workflow.

## Features

- **Instant context** → copy entire project slices with `-c`
- **Reverse workflow** → `apply` turns Markdown back into files
- **Noise-tolerant parsing** → ignores explanations, keeps only code
- **Smart Markdown wrapping** → prevents broken code blocks
- **Precision controls** → limit lines, add numbers, absolute paths (only for context)
- **Documentation mode (`-D`)** → helps LLMs follow the codepick format correctly
- **Binary-safe** → avoids dumping unreadable content
- **.gitignore aware** → respects your repo by default

To apply the copied LLM response, a format called [codepick](./CODEPICK_FORMAT.md) is used. This is perfectly parsed, and —unlike diffs or other response formats— it packages the entire content of the file.

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

### Pick (extract context)

```bash
codepicker pick [options] <patterns...>
```

> [!note]
> pick command is optional, just use:
> `codepicker [options] <patterns...>`

#### Options

| Option                       | Description                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------ |
| `<patterns...>`              | Required [glob file patterns](https://github.com/micromatch/picomatch#globbing-features) to find |
| `-c, --clipboard`            | Copy output to clipboard                                                                         |
| `-D, --include-docs`         | Append 'What is Codepick Format?' documentation                                                  |
| `-a, --absolute`             | Use absolute paths                                                                               |
| `-l, --lines <n>`            | Limit lines per file                                                                             |
| `-p, --paths`                | Output only file paths                                                                           |
| `-V, --version`              | Show version                                                                                     |
| `-h, --help`                 | Help                                                                                             |
| `--no-gitignore`             | Don't use .gitignore rules                                                                       |
| `--no-codeignore`            | Don't use .codeignore rules                                                                      |
| `--no-dot-ignore`            | Don't use .ignore rules                                                                          |
| `--no-default-patterns`      | Don't use [default codepicker rules](./src/consts.ts) (node_modules, .git, etc...)               |
| `--include-line-numbers`     | Show line numbers                                                                                |
| `--remote <url>`             | Read code from a remote repository                                                               |
| `--remote-branch <checkout>` | Specify a commit, branch or tag from remote repository                                           |

---

### Apply (write changes)

```bash
codepicker apply [options] [dump-file]
```

#### Options

| Option             | Description                              |
| ------------------ | ---------------------------------------- |
| `[dump-file]`      | Markdown file with code blocks           |
| `-c, --clipboard`  | Read from clipboard instead of dump file |
| `-d, --dir <path>` | Target directory (default current)       |
| `--dry-run`        | Preview changes without write            |

## Typical Workflow

### 1. Extract context

```bash
codep -Dc "src/services/**.ts" "src/views/**.tsx"
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
codepicker "src/**.ts" -cD
```

The `-D` flag appends the full format spec so the model responds correctly.

## Remote repository

You can read code from remote repositories:

```bash
codepicker "src/**.ts" --remote https://github.com/rodnye/codepicker
```

```bash
codepicker "src/**.{ts,tsx,astro}" "package.json" \
  --remote https://github.com/rodnye/wa-catalog \
  --remote-branch main
```

## Backups

```bash
codepicker "src/**" > backup.md
```

Restore anytime:

```bash
codepicker apply backup.md
```

## Useful Patterns

### Limit output

```bash
codepicker "src/**.ts" -l 5
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
codepicker "dist/**.js" --no-gitignore --no-default-patterns
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
