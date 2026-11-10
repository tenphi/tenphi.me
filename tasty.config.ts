import { colorTokens } from './src/config/theme';

export default {
  tokens: [
    ...Object.keys(colorTokens),

    '$gap',
    '$radius',
    '$large-card-radius',
    '#glass-fill',
    '#glass-edge',
    '$glass-edge-lift',
    '$glass-edge-shade',
    '$glass-fill-shade',
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

  recipes: ['glass', 'glass-edge', 'glass-accent'],

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
