import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Codepicker',
  tagline:
    'Transforma tu código en Markdown y viceversa. Optimizado para LLMs.',
  favicon: 'img/favicon.ico',
  url: 'https://codepicker.dev',
  baseUrl: '/',
  organizationName: 'rodnye',
  projectName: 'codepicker',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/rodnye/codepicker/tree/main/website/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/rodnye/codepicker/tree/main/website/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Codepicker',
      logo: {
        alt: 'Codepicker Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentación',
        },
        { to: '/blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/rodnye/codepicker',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentación',
          items: [
            { label: 'Introducción', to: '/docs/intro' },
            { label: 'Primeros Pasos', to: '/docs/getting-started' },
            { label: 'Formato Codepick', to: '/docs/concepts/codepick-format' },
          ],
        },
        {
          title: 'Recursos',
          items: [
            { label: 'GitHub', href: 'https://github.com/rodnye/codepicker' },
            {
              label: 'NPM',
              href: 'https://www.npmjs.com/package/codepicker-tool',
            },
            {
              label: 'Issues',
              href: 'https://github.com/rodnye/codepicker/issues',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Codepicker. Construido con Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
