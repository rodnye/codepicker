# Flujo de Trabajo con LLMs

Codepicker brilla cuando se integra en tu flujo de trabajo diario con Modelos de Lenguaje Grande (LLMs) como ChatGPT, Claude o Gemini. Aquí te mostramos cómo sacarle el máximo provecho.

## El Problema del Contexto

Los LLMs tienen ventanas de contexto limitadas y a menudo "olvidan" o alucinan rutas de archivos cuando se les pide que modifiquen código.
Además, copiar y pegar manualmente decenas de archivos es propenso a errores.

## La Solución: Codepicker

### Paso 1: Extraer Contexto

Selecciona los archivos relevantes para tu tarea y cópialos al portapapeles:

```bash
codep -cD "src/services/**/*.ts" "src/views/**/*.tsx"
```

:::info El flag `-D`
El flag `-D` (o `--include-docs`) es **crucial**. Añade la especificación del formato Codepick al final del prompt. Esto "entrena" al LLM en el momento para que devuelva la respuesta en el formato exacto que `codep apply` puede procesar.
:::

### Paso 2: Interactuar con el LLM

Pega el contenido en tu LLM y dale instrucciones:

```text
Aquí está el contexto de mi proyecto.
Por favor, modifica la vista para añadir un botón con un mono en calzones bailando.
IMPORTANTE: Devuelve los archivos modificados usando estrictamente el formato Codepick.
```

### Paso 3: Aplicar los Cambios

Una vez que el LLM te devuelva la respuesta, cópiala y ejecuta:

```bash
codep apply -c
```

¡Listo! Tus archivos se actualizarán automáticamente en tu sistema de archivos.

## Consejos para Mejores Resultados

1. **Sé específico con los patrones**: No extraigas todo el proyecto si solo necesitas modificar un módulo específico. Esto ahorra tokens y reduce la confusión del LLM.
2. **Usa `--dry-run`**: Si no estás seguro de los cambios que el LLM propone, usa `codep apply -c --dry-run` para ver qué archivos se verían afectados antes de aplicarlos.
3. **Respeta el `.gitignore`**: Por defecto, Codepicker ignora `node_modules`, `.git`, etc. No uses `--no-gitignore` a menos que sea estrictamente necesario, para evitar saturar el contexto del LLM con archivos irrelevantes.
