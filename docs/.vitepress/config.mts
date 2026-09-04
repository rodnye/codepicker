import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Codepicker Docs',
  base: process.env.BASE_URL ?? '/',
  description:
    'Pick code into Markdown. Apply Markdown to code. Built for LLMs and quick backups.',
  locales: {
    es: { label: 'Español', lang: 'es' },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/es' },
      { text: 'Guías', link: '/es/02_getting-started' },
    ],
    sidebar: {
      '/es/': [
        {
          text: 'Introducción',
          items: [
            { text: '¿Qué es esto?', link: '/es/01_intro' },
            { text: 'Primeros Pasos', link: '/es/02_getting-started' },
            { text: 'Uso Básico', link: '/es/03_usage' },
            { text: 'Ejemplo Práctico', link: '/es/usage-example' },
            { text: 'Preguntas Frecuentes', link: '/es/faq' },
            { text: 'Contribuir', link: '/es/contributing' },
          ],
        },
        {
          text: 'Comandos',
          items: [
            { text: 'Pick', link: '/es/commands/pick' },
            { text: 'Apply', link: '/es/commands/apply' },
          ],
        },
        {
          text: 'Conceptos',
          items: [
            { text: 'Formato Codepick', link: '/es/concepts/codepick-format' },
          ],
        },
        {
          text: 'Guías Avanzadas',
          items: [
            { text: 'Opciones Avanzadas', link: '/es/guides/advanced-options' },
            {
              text: 'Flujo de Trabajo con LLMs',
              link: '/es/guides/llm-workflow',
            },
            {
              text: 'Scripting e instalación',
              link: '/es/guides/installation',
            },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/rodnye/codepicker' },
    ],
  },
});
