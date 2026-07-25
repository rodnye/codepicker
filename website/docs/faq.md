---
sidebar_position: 9
title: FAQ
description: Answers to the most common questions about Codepicker.
---

# Frequently Asked Questions

## What is the Codepick format?

It's a simple Markdown-based format where each file is represented as a code block with its path on the first line. This format is easy to read for both humans and LLMs, and allows applying changes in a structured way.

## Can I use Codepicker with any LLM?

Yes, any model that can generate Markdown text can produce Codepick format output. You just need to tell it to use that format.

## How do I prevent large files from being included?

Use the `-l, --lines` option to limit the number of lines per file. You can also exclude files with negative glob patterns, for example:

```bash
codepicker "src/**.ts" "!src/**.test.ts"
```

## Does Codepicker respect .gitignore?

Yes, by default it respects `.gitignore` rules. You can disable this behavior with `--no-gitignore`.

## Can I use it on remote repositories without cloning them manually?

Yes, using the `--remote <url>` option. Codepicker clones the repository into a temporary directory and operates on it.

## What happens if the LLM returns files that already exist?

Codepicker will overwrite existing files. If you want to avoid overwriting, use `--dry-run` first to see which files would be modified.

## How can I see which files will be applied without making changes?

Use `codepicker apply -c --dry-run`. It will show the paths and status (created, updated, skipped).

## Does Codepicker work on Windows?

Yes, Codepicker is tested on Windows, macOS, and Linux.

## Where can I get additional help?

You can open an issue on [GitHub](https://github.com/rodnye/codepicker/issues).
