# Codepick Format

## What is it?

Codepick format is a structured Markdown syntax for embedding file contents with their paths. Each file is represented as a code block where:

1. **Opening tag**: 3+ backticks followed by an optional language extension
2. **First line inside**: `// file/path.ext` (the target filesystem path)
3. **Content**: The actual file contents (any text)
4. **Closing tag**: Same number of backticks as opening

## Example

````
```ts
// src/index.ts
console.log('Hello');
```

```json
// config.json
{
  "name": "my-app"
}
```
````

## Rules

- Paths must start with `// ` (space after slashes)
- Code blocks with different backtick counts are supported
- Text between blocks is ignored (noise allowed)
- Empty lines inside blocks are preserved
