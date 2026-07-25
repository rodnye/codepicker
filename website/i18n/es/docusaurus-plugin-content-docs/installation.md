---
sidebar_position: 2
title: Instalación
description: Cómo instalar Codepicker en tu sistema.
---

# Instalación

## Requisitos previos

- [Node.js](https://nodejs.org) versión 20 o superior.
- npm, yarn o pnpm.

## Instalación global (recomendada)

```bash
npm install -g codepicker-tool
```

Después de la instalación, verifica que todo funciona:

```bash
codepicker --version
```

También puedes usar el alias `codep`:

```bash
codep --version
```

## Uso con npx (sin instalación)

Si prefieres no instalar globalmente, puedes ejecutar Codepicker directamente con `npx`:

```bash
npx codepicker-tool pick "src/**/*.ts"
```

## Instalación local en un proyecto

```bash
npm install --save-dev codepicker-tool
```

Luego puedes agregar scripts en tu `package.json`:

```json
{
  "scripts": {
    "pick-tests": "codepicker pick 'tests/**'",
    "pick-src": "codepicker pick 'src/**' '!**.svg'"
  }
}
```

## Actualización

Para actualizar a la última versión:

```bash
npm update -g codepicker-tool
```

O si usas `npx`, siempre obtendrás la última versión disponible.

## Solución de problemas

Para más ayuda, consulta las [preguntas frecuentes](./faq.md).
