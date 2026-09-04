# Primeros Pasos

Instalar y configurar Codepicker es extremadamente sencillo. Sigue estos pasos para empezar a optimizar tu flujo de trabajo con LLMs.

## Requisitos Previos

- [Node.js](https://nodejs.org/) versión 18 o superior.
- Un gestor de paquetes como `npm`, `yarn` o `pnpm`.

## Instalación

Puedes instalar Codepicker globalmente para tenerlo disponible en cualquier proyecto:

::: code-group

```sh [npm]
$ npm install -g codepicker-tool
```

```sh [pnpm]
$ pnpm add -g codepicker-tool
```

```sh [yarn]
# Para Yarn >=2.x no existe este comando, por favor revisar uso directo con `yarn dlx` más adelante
yarn global add codepicker-tool
```

```sh [bun]
$ bun add -g codepicker-tool
```

```sh [deno]
$ deno install -g codepicker-tool
```

:::

### Verificar la Instalación

Una vez instalado, verifica que todo funcione correctamente comprobando la versión:

```sh
codepicker --version
# o usando el alias corto
codep --version
```

:::tip Alias Corto
`codep` es simplemente un alias más corto para `codepicker`. Puedes usarlo para ahorrar tiempo al escribir comandos.
:::

## Tu Primer Uso

Vamos a extraer el contexto de algunos archivos TypeScript de tu proyecto y copiarlo al portapapeles:

```sh
codep -c "src/**.ts"
```

Esto buscará todos los archivos `.ts` en la carpeta `src`, los convertirá al formato Codepick y los copiará a tu portapapeles. Ahora solo tienes que pegarlos en tu LLM favorito y empezar a trabajar.

## Siguientes Pasos

- ¿Aprender rápido a usar esto? Mira este [Ejemplo práctico](./usage-example.md)
- Aprende a usar el comando [Pick](./commands/pick) en detalle.
- Descubre cómo aplicar los cambios con [Apply](./commands/apply).
- Entiende el [Formato Codepick](./concepts/codepick-format).
