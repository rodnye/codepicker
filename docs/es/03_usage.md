# Uso básico

Codepicker se divide en dos comandos principales:

- `pick` (por defecto) para extraer contexto.
- `apply` para aplicar cambios.

> Puedes revisar este [Ejemplo práctico](./usage-example)

## Extraer contexto (pick)

El comando `pick` escanea los archivos que coinciden con los patrones glob proporcionados y genera una salida en Markdown con el contenido de cada archivo.

```sh
codep pick "src/**/*.ts" "!src/**/*.test.ts"
```

Si no especificas `pick`, es el comando por defecto:

```sh
codep "src/**/*.ts"
```

### Opciones más comunes

| Opción                     | Descripción                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| `-c, --clipboard`          | Copia la salida al portapapeles en lugar de imprimirla en consola.                            |
| `-a, --absolute`           | Muestra rutas absolutas en lugar de relativas.                                                |
| `-l, --lines <n>`          | Limita el número de líneas por archivo.                                                       |
| `--include-line-numbers`   | Agrega números de línea al contenido.                                                         |
| `-D, --include-docs`       | Incluye la documentación del formato Codepick al final de la salida (útil para guiar al LLM). |
| `--no-gitignore`           | Ignora las reglas de `.gitignore`.                                                            |
| `--remote <url>`           | Clona un repositorio remoto y extrae desde allí.                                              |
| `--remote-branch <branch>` | Especifica la rama, tag o commit a usar con `--remote`.                                       |

### Ejemplos

1. Extraer todos los archivos TypeScript de la carpeta `src` y copiarlos al portapapeles:

```sh
codep "src/**/*.ts" -c
```

2. Extraer solo archivos con menos de 50 líneas:

```sh
codep "src/**/*.js" -l 50
```

3. Extraer desde un repositorio remoto:

```sh
codep "packages/**/*.md" --remote https://github.com/rodnye/codepicker --remote-branch main
```

## Aplicar cambios (apply)

El comando `apply` lee un archivo Markdown (o el portapapeles) que contiene bloques de código en **formato Codepick** y escribe los archivos en disco.

```sh
codep apply archivo.md
```

### Opciones

| Opción             | Descripción                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| `-c, --clipboard`  | Lee desde el portapapeles en lugar de un archivo.                         |
| `-d, --dir <path>` | Directorio base donde se escribirán los archivos (por defecto el actual). |
| `--dry-run`        | Muestra una vista previa de los cambios sin escribirlos.                  |

### Ejemplos

1. Aplicar desde el portapapeles:

```sh
codep apply -c
```

2. Aplicar desde un archivo `respuesta.md`:

```sh
codep apply respuesta.md
```

3. Vista previa sin cambios:

```sh
codep apply -c --dry-run
```

## Flujo de trabajo típico

1. **Extraer contexto**:

```sh
codep "src/**.ts" "src/**.css" -c
```

2. **Pegar en el LLM** y pedir modificaciones, indicando que use el formato Codepick.

3. **Aplicar la respuesta**:

```sh
codep apply -c
```

> Puedes revisar este [Ejemplo práctico](./usage-example)
