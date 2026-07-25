import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Codepicker',
  tagline:
    'Transform your code into Markdown and vice versa. Optimized for LLMs.',
  favicon: 'img/logo.png',
  url: 'https://rodny.is-a.dev',
  baseUrl: '/codepicker',
  organizationName: 'rodnye',
  projectName: 'codepicker',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
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
    image: 'img/logo.png',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Codepicker',
      logo: {
        alt: 'Codepicker Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        { to: '/blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/rodnye/codepicker',
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Introduction', to: '/docs/intro' },
            { label: 'Getting Started', to: '/docs/getting-started' },
            { label: 'Codepick Format', to: '/docs/concepts/codepick-format' },
          ],
        },
        {
          title: 'Resources',
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
      copyright: `Copyright © ${new Date().getFullYear()} Codepicker. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
