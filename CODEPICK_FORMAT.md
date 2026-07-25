# Codepick Format

## What is it?

Codepick format is a structured Markdown syntax for embedding file contents with their paths. Each file is represented as a code block where:

1. **Opening tag**: 5+ backticks (`) followed by an optional language extension
2. **First line inside**: `// file/path.ext` (the target filesystem path)
3. **Content**: The actual file contents (any text)
4. **Closing tag**: Same number of backticks as opening

## Example

`````ts
// src/index.ts
console.log('Hello');
`````

`````json
// config.json
{
  "name": "my-app"
}
`````

`````ruby
// app/controllers/devices/application_controller.rb
class ApplicationController < ActionController::Base
    allow_browser versions: :modern
end
`````

## Rules

- Paths must start with `// ` (space after slashes)
- The first line of the code block must contain **only and exclusively** the path (e.g., `// src/index.ts`), with no additional text, comments, or characters
- Code blocks with different backtick counts are supported
- Text between blocks is ignored (noise allowed)
- Empty lines inside blocks are preserved
- It is recommended to use 5 backticks (`) for wrap the code block fences to avoid conflicts with nested triple backticks inside file contents
