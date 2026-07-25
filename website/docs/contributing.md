---
sidebar_position: 8
title: Contributing
description: How to contribute to the development of Codepicker.
---

# Contributing

Thank you for your interest in contributing to Codepicker! We appreciate any kind of contribution, whether it's reporting bugs, improving documentation, or submitting code. The power of Open Source :)

## Reporting Bugs

If you find a bug, please open an issue on [GitHub](https://github.com/rodnye/codepicker/issues) with:

- A clear description of the problem.
- Steps to reproduce it.
- Node.js and OS version.
- If possible, a minimal example.

## Improving Documentation

The documentation is in the `website/docs` folder. You can submit a Pull Request with your improvements.

## Development

### Clone the repository

```bash
git clone https://github.com/rodnye/codepicker.git
cd codepicker
```

### Install dependencies

```bash
pnpm install
```

### Build the project

```bash
pnpm run build
```

### Run tests

```bash
pnpm test
```

### Run the documentation site locally

```bash
pnpm install
pnpm run web:start
```

## Submitting a Pull Request

1. Fork the repository.
2. Create a branch for your change (`git checkout -b feat/my-change`).
3. Make the changes and commit.
4. Make sure the tests pass.
5. Submit the Pull Request to the `main` branch.

## Code Style

- Use TypeScript.
- Follow the existing code style (ESLint and Prettier are configured).
- Write tests for new features.

## License

By contributing, you agree that your code will be licensed under the [MIT License](https://github.com/rodnye/codepicker/blob/main/LICENSE).
