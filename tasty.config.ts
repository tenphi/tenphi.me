import { colorTokens } from './src/config/theme';

export default {
  tokens: [
    ...Object.keys(colorTokens),

    '$gap',
    '$radius',
    '$max-width',
    '$font',
    '$monospace-font',
    '$default-font-size',
    '$default-line-height',
    '$default-font-weight',
    '$content-width',
  ],

  states: ['@mobile', '@tablet', '@desktop', '@dark'],

  presets: ['h1', 'h2', 'h3', 't1', 't2', 't3', 'nav', 'code', 'label', 'overline'],
};
