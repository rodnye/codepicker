---
sidebar_position: 6
title: Preguntas frecuentes
description: Respuestas a las dudas más comunes sobre Codepicker.
---

# Preguntas frecuentes

## ¿Qué es el formato Codepick?

Es un formato simple basado en Markdown donde cada archivo se representa como un bloque de código con su ruta en la primera línea. Este formato es fácil de leer para humanos y para LLMs, y permite aplicar cambios de forma estructurada.

## ¿Puedo usar Codepicker con cualquier LLM?

Sí, cualquier modelo que pueda generar texto en Markdown puede producir salida en formato Codepick. Solo debes indicarle que use ese formato.

## ¿Cómo evito que se incluyan archivos grandes?

Usa la opción `-l, --lines` para limitar el número de líneas por archivo. También puedes excluir archivos con patrones glob negativos, por ejemplo:

```bash
codepicker "src/**.ts" "!src/**.test.ts"
```

## ¿Codepicker respeta .gitignore?

Sí, por defecto respeta las reglas de `.gitignore`. Puedes desactivar este comportamiento con `--no-gitignore`.

## ¿Puedo usarlo en repositorios remotos sin clonarlos manualmente?

Sí, usando la opción `--remote <url>`. Codepicker clona el repositorio en un directorio temporal y opera sobre él.

## ¿Qué pasa si el LLM devuelve archivos que ya existen?

Codepicker sobrescribirá los archivos existentes. Si quieres evitar sobrescrituras, usa `--dry-run` primero para ver qué archivos se modificarían.

## ¿Cómo puedo ver qué archivos se van a aplicar sin hacer cambios?

Usa `codepicker apply -c --dry-run`. Mostrará las rutas y el estado (creado, actualizado, omitido).

## ¿Codepicker funciona en Windows?

Sí, Codepicker está probado en Windows, macOS y Linux.

## ¿Dónde puedo obtener ayuda adicional?

Puedes abrir un issue en [GitHub](https://github.com/rodnye/codepicker/issues).
