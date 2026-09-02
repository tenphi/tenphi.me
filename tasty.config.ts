import { colorTokens } from './src/config/theme';

export default {
  tokens: [
    ...Object.keys(colorTokens),

    '$gap',
    '$radius',
    '$max-width',
    '$prose-width',
    '$font',
    '$monospace-font',
    '$default-font-size',
    '$default-line-height',
    '$default-font-weight',
    '$content-width',
  ],

  states: ['@mobile', '@tablet', '@desktop', '@dark', '@high-contrast'],

  presets: [
    'h1',
    'h2',
    'h3',
    't1',
    't2',
    'prose',
    't3',
    'nav',
    'code',
    'label',
    'overline',
  ],
};
