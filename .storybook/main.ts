import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

/** GitHub project Pages serve under /<repo>/ — required for asset + iframe URLs. */
const pagesBase = process.env.STORYBOOK_BASE_PATH || '/';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {
      // Quill is not StrictMode-safe without careful destroy; avoid double-mount in canvas.
      strictMode: false,
      builder: {
        viteConfigPath: '.storybook/vite.config.ts',
      },
    },
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      base: pagesBase,
    });
  },
};

export default config;
