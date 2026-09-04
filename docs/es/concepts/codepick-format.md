# Formato Codepick

El **Formato Codepick** es una sintaxis estructurada de Markdown diseñada para incrustar contenido de archivos junto con sus rutas de destino.

Este formato es el núcleo de cómo Codepicker se comunica con los LLMs, garantizando que el contexto se preserve y se pueda aplicar de vuelta al sistema de archivos sin ambigüedades.

## Ejemplo

::: code-group

````markdown [codepick-output.md]
```ts
// src/index.ts
console.log('Hola');
```

```json
// config.json
{
  "name": "mi-app"
}
```
````

:::

## Estructura

Cada archivo se representa como un bloque de código donde:

1. **Etiqueta de apertura**: 3 o más comillas invertidas seguidas de una extensión de lenguaje opcional.

::: code-group

````markdown [codepick-output.md]
// [!code ++]

```ts
// src/index.ts
console.log('Hola');
```

// [!code ++]

```json
// config.json
{
  "name": "mi-app"
}
```
````

:::

2. **Primera línea interna**: `// ruta/del/archivo.ext` (la ruta del sistema de archivos destino).

::: code-group

````markdown [codepick-output.md]
```ts
// [!code ++]
// src/index.ts
console.log('Hola');
```

```json
// [!code ++]
// config.json
{
  "name": "mi-app"
}
```
````

:::

3. **Contenido**: El contenido real del archivo (cualquier texto).

::: code-group

````markdown [codepick-output.md]
```ts
// src/index.ts
// [!code ++]
console.log('Hola');
```

```json
// config.json
// [!code ++:3]
{
  "name": "mi-app"
}
```
````

:::

4. **Etiqueta de cierre**: El mismo número de comillas invertidas que en la apertura.

::: code-group

````markdown [codepick-output.md]
```ts
// src/index.ts
console.log('Hola');
// [!code ++]
```

```json
// config.json
{
  "name": "mi-app"
}
// [!code ++]
```
````

:::

## Reglas del Formato

- Las rutas deben comenzar con `// ` (con un espacio después de las barras).
- La primera línea del bloque de código debe contener **exclusivamente** la ruta (ej. `// src/index.ts`), sin texto adicional, comentarios o caracteres extra.
- Se soportan bloques de código con diferentes cantidades de comillas invertidas.
- El texto entre bloques (explicaciones, ruido) es ignorado por el parser.
- Las líneas vacías dentro de los bloques se preservan.

:::tip Recomendación
Se recomienda usar **5 o más comillas invertidas** (` ````` `) para envolver los bloques de código y evitar conflictos con bloques de triple comilla anidados dentro del contenido del archivo.
:::

## Archivos Binarios

Los archivos binarios no se vuelcan como bytes crudos. En su lugar, se reemplazan con metadatos:

````markdown
```png
// assets/logo.png
// [BINARY FILE] - Size: 0.024 MB
```
````

Esto evita corromper la salida de Markdown y mantiene el tamaño del contexto bajo control.
