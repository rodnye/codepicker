---
sidebar_position: 5
title: Contribuir
description: Cómo contribuir al desarrollo de Codepicker.
---

# Contribuir

¡Gracias por tu interés en contribuir a Codepicker! Apreciamos cualquier tipo de contribución, ya sea reportando errores, mejorando la documentación o enviando código. El poder del Open Source :)

## Reportar errores

Si encuentras un error, por favor abre un issue en [GitHub](https://github.com/rodnye/codepicker/issues) con:

- Una descripción clara del problema.
- Pasos para reproducirlo.
- Versión de Node.js y del sistema operativo.
- Si es posible, un ejemplo mínimo.

## Mejorar la documentación

La documentación está en la carpeta `website/docs`. Puedes enviar un Pull Request con tus mejoras.

## Desarrollo

### Clonar el repositorio

```bash
git clone https://github.com/rodnye/codepicker.git
cd codepicker
```

### Instalar dependencias

```bash
pnpm install
```

### Construir el proyecto

```bash
pnpm run build
```

### Ejecutar pruebas

```bash
pnpm test
```

### Ejecutar el sitio de documentación localmente

```bash
pnpm install
pnpm run web:start
```

## Enviar un Pull Request

1. Haz un fork del repositorio.
2. Crea una rama para tu cambio (`git checkout -b feat/mi-cambio`).
3. Realiza los cambios y haz commit.
4. Asegúrate de que las pruebas pasen.
5. Envía el Pull Request a la rama `main`.

## Estilo de código

- Usa TypeScript.
- Sigue el estilo de código existente (ESLint y Prettier están configurados).
- Escribe pruebas para nuevas funcionalidades.

## Licencia

Al contribuir, aceptas que tu código será licenciado bajo la [MIT License](https://github.com/rodnye/codepicker/blob/main/LICENSE).
