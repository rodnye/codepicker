---
sidebar_position: 2
title: Installation
description: How to install Codepicker on your system.
---

# Installation

## Prerequisites

- [Node.js](https://nodejs.org) version 20 or higher.
- npm, yarn, or pnpm.

## Global Installation (Recommended)

```bash
npm install -g codepicker-tool
```

After installation, verify that everything works:

```bash
codepicker --version
```

You can also use the `codep` alias:

```bash
codep --version
```

## Usage with npx (No Installation)

If you prefer not to install globally, you can run Codepicker directly with `npx`:

```bash
npx codepicker-tool pick "src/**/*.ts"
```

## Local Installation in a Project

```bash
npm install --save-dev codepicker-tool
```

Then you can add scripts in your `package.json`:

```json
{
  "scripts": {
    "pick-tests": "codepicker pick 'tests/**'",
    "pick-src": "codepicker pick 'src/**' '!**.svg'"
  }
}
```

## Updating

To update to the latest version:

```bash
npm update -g codepicker-tool
```

Or if you use `npx`, you will always get the latest available version.

## Troubleshooting

For more help, check the [FAQ](./faq.md).
