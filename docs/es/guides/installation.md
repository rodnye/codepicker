# Más opciones de Instalación

## Requisitos previos

- [Node.js](https://nodejs.org) versión 18 o superior.
- npm, yarn o pnpm.

## Instalación global (recomendada)

::: code-group

```sh [npm]
$ npm install -g codepicker-tool
```

```sh [pnpm]
$ pnpm add -g codepicker-tool
```

```sh [yarn]
# Para Yarn >=2.x no existe este comando, por favor revisar uso directo con `yarn dlx` más adelante
$ yarn global add codepicker-tool
```

```sh [bun]
$ bun add -g codepicker-tool
```

```sh [deno]
$ deno install -g codepicker-tool
```

:::

Después de la instalación, verifica que todo funciona:

```sh
$ codepicker --version
```

También puedes usar el alias `codep`:

```bash
$ codep --version
```

## Actualización

Para actualizar a la última versión:

::: code-group

```sh [npm]
$ npm update -g codepicker-tool
```

```sh [pnpm]
$ pnpm update -g codepicker-tool
```

```sh [yarn]
# Para Yarn >=2.x no existe este comando, por favor revisar uso directo con $yarn dlx más adelante
$ yarn global upgrade codepicker-tool
```

```sh [bun]
$ bun update -g codepicker-tool
```

```sh [deno]
$ deno install -g npm:codepicker-tool@latest
```

:::

O si usas `npx`, siempre obtendrás la última versión disponible.

## Uso con ejecución directa (sin instalación)

Si prefieres no instalar globalmente, puedes ejecutar Codepicker directamente con `npx` o el comando que se utiliza en tu correspondiente gestor:

::: code-group

```sh [npm]
$ npx codepicker-tool
```

```sh [pnpm]
$ pnpm dlx codepicker-tool
```

```sh [yarn]
$ yarn dlx codepicker-tool
```

```sh [bun]
$ bunx codepicker-tool
```

```sh [deno]
$ deno run -A npm:codepicker-tool
```

:::

## Instalación local en un proyecto

::: code-group

```sh [npm]
$ npm install -D codepicker-tool
```

```sh [pnpm]
$ pnpm add -D codepicker-tool
```

```sh [yarn]
$ yarn add -D codepicker-tool
```

```sh [bun]
$ bun add -d codepicker-tool
```

```sh [deno]
$ deno add -D codepicker-tool
```

:::

Luego puedes agregar scripts en tu `package.json`:

::: code-group

```json [package.json]
{
  "scripts": {
    "pick:tests": "codepicker pick 'tests/**'",
    "pick:src": "codepicker pick 'src/**' '!**.svg'"
  }
}
```

:::

## Solución de problemas

Para más ayuda, consulta las [preguntas frecuentes](../faq).
