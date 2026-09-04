# Introducción a Codepicker

**Codepicker** es una poderosa herramienta CLI bidireccional que transforma tu código fuente en Markdown estructurado, y viceversa. Está diseñada específicamente para hacer que trabajar con Modelos de Lenguaje Grande (LLMs) en proyectos reales sea **rápido, predecible y sin límites**.

> Puedes hechar un vistazo a este [Ejemplo rápido](./usage-example)

## Características

- ⚡ **Contexto Instantáneo**: Copia secciones completas del proyecto con el flag `-c`.
- 🔄 **Flujo Bidireccional**: El comando `apply` convierte Markdown de vuelta a archivos en tu disco.
- 🧠 **Tolerante al Ruido**: Ignora explicaciones y texto extra, manteniendo solo el código válido.
- 🛡️ **Envoltorio Inteligente**: Previene bloques de código rotos ajustando el número de comillas invertidas.
- 🎯 **Controles de Precisión**: Limita líneas, añade números, usa rutas absolutas.
- 📄 **Modo Documentación (`-D`)**: Ayuda a los LLMs a seguir el formato Codepick correctamente.
- 📦 **Seguro con Binarios**: Evita volcar contenido ilegible de archivos binarios.
- 🙈 **Consciente de `.gitignore`**: Respeta tu repositorio por defecto.

Trabajar con chats de LLMs en bases de código existentes suele ser un proceso tedioso:

1. Abrir archivos manualmente.
2. Copiar rutas y contenido.
3. Pegar en el chat.
4. Repetir el proceso.
5. Reconstruir los cambios manualmente.

Incluso con agentes de IDE, a menudo estás limitado a su flujo de trabajo específico. **Codepicker** elimina esta fricción, permitiéndote mover el contexto dentro y fuera de tu proyecto con un par de comandos.

## ¿Por qué dices "Bidireccional"?

Esta no es la primera herramienta que permite recolectar contexto para la IA. Un ejemplo popular es [Repomix](https://repomix.com) que hace algo similar,
exporta todo tu proyecto a un archivo `repomix-output.xml` y luego... ya?

Ese archivo puedes subirlo a ChatGPT y pedirle "Revisa que problemas puede tener mi código". Pero imagina que ChatGPT te sugiera algunos cambios,
tendrías que aplicarlos manualmente.

Esto no ocurre con CODEPICKER, cuando la IA te dice el contenido a cambiar de un archivo, puedes insertarlo automaticamente con un solo comando!

## ¿Cómo funciona?

Codepicker utiliza un formato estructurado llamado **Codepick Format**. Cada archivo se representa como un bloque de código donde la primera línea indica la ruta del sistema de archivos destino.

````markdown
```ts
// src/index.ts
console.log('Hola Mundo');
```
````

Este formato es perfectamente parseable y, a diferencia de los diffs o formatos de respuesta tradicionales, empaqueta el contenido completo del archivo, eliminando ambigüedades.

Todo en orden? Dirígete a la sección de [Primeros Pasos](./02_getting-started).
