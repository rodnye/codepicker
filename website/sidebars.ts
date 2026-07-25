import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'getting-started',
    {
      type: 'category',
      label: 'Comandos',
      collapsed: false,
      items: ['commands/pick', 'commands/apply'],
    },
    {
      type: 'category',
      label: 'Conceptos',
      collapsed: false,
      items: ['concepts/codepick-format'],
    },
    {
      type: 'category',
      label: 'Guías',
      collapsed: false,
      items: ['guides/llm-workflow', 'guides/advanced-options'],
    },
  ],
};

export default sidebars;
