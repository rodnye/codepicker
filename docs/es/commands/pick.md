---
sidebar_position: 3
slug: /commands/pick
---

# Comando Pick

El comando `pick` (que es el comando por defecto) extrae el contenido de tus archivos y lo convierte a Markdown estructurado.

## Sintaxis Básica

```bash
codepicker pick [opciones] <patrones...>
```

:::note Comando por Defecto
El subcomando `pick` es opcional. Puedes simplemente usar:

```bash
codepicker [opciones] <patrones...>
```

:::

## Opciones Disponibles

| Opción                       | Descripción                                                                                                     |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `<patrones...>`              | **Requerido**. [Patrones glob](https://github.com/micromatch/picomatch#globbing-features) para buscar archivos. |
| `-c, --clipboard`            | Copia la salida directamente al portapapeles.                                                                   |
| `-D, --include-docs`         | Añade la documentación del formato Codepick al final (útil para LLMs).                                          |
| `-a, --absolute`             | Usa rutas absolutas en lugar de relativas.                                                                      |
| `-l, --lines <n>`            | Limita el número de líneas por archivo.                                                                         |
| `-p, --paths`                | Muestra solo las rutas de los archivos, sin contenido.                                                          |
| `--include-line-numbers`     | Añade números de línea al inicio de cada línea.                                                                 |
| `--no-gitignore`             | Ignora las reglas de `.gitignore`.                                                                              |
| `--no-codeignore`            | Ignora las reglas de `.codeignore`.                                                                             |
| `--no-default-patterns`      | Ignora los patrones por defecto (node_modules, .git, etc.).                                                     |
| `--remote <url>`             | Lee código desde un repositorio remoto.                                                                         |
| `--remote-branch <checkout>` | Especifica una rama, tag o commit del repositorio remoto.                                                       |

## Ejemplos Prácticos

### Copiar al Portapapeles

Extraer todos los archivos de React y copiarlos al portapapeles:

```bash
codep -c "src/**/*.tsx"
```

### Incluir Documentación para el LLM

Si notas que el LLM no respeta el formato de salida, incluye la documentación del formato:

```bash
codep -cD "src/services/**/*.ts"
```

### Listar Solo Rutas

Útil para alimentar otras herramientas como `xargs` o `grep`:

```bash
codep "src/**/*.ts" -p -a
```

### Limitar Líneas

Para archivos muy grandes donde solo necesitas ver la estructura:

```bash
codep "src/**/*.ts" -l 50
```

### Repositorios Remotos

Extraer código directamente de un repositorio de GitHub sin clonarlo manualmente:

```bash
codep "src/**/*.ts" --remote https://github.com/rodnye/codepicker --remote-branch main
```
