import { configure, generateTypographyTokens } from '@tenphi/tasty';

import { colorTokens } from './theme';

const typographyTokens = generateTypographyTokens({
  h1: {
    fontSize: '32px',
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
    fontWeight: '700',
    boldFontWeight: '700',
  },
  h2: {
    fontSize: '24px',
    lineHeight: '1.3',
    letterSpacing: '-0.01em',
    fontWeight: '600',
    boldFontWeight: '700',
  },
  h3: {
    fontSize: '20px',
    lineHeight: '1.4',
    fontWeight: '600',
    boldFontWeight: '700',
  },
  t1: {
    fontSize: '18px',
    lineHeight: '1.6',
    fontWeight: '400',
    boldFontWeight: '600',
  },
  t2: {
    fontSize: '15px',
    lineHeight: '1.5',
    fontWeight: '400',
    boldFontWeight: '600',
  },
  t3: {
    fontSize: '13px',
    lineHeight: '1.5',
    fontWeight: '400',
    boldFontWeight: '600',
  },
  nav: {
    fontSize: '15px',
    lineHeight: '1.4',
    fontWeight: '400',
    boldFontWeight: '600',
  },
  code: {
    fontSize: '13px',
    lineHeight: '1.5',
    fontWeight: '400',
    boldFontWeight: '600',
    fontFamily: '"Source Code Pro", ui-monospace, monospace',
  },
  label: {
    fontSize: '13px',
    lineHeight: '1.4',
    fontWeight: '600',
    boldFontWeight: '700',
  },
});

configure({
  states: {
    '@mobile': '@media(w < 640px)',
    '@tablet': '@media(640px <= w < 1024px)',
    '@desktop': '@media(w >= 1024px)',
    '@dark': '@media(prefers-color-scheme: dark)',
  },
  tokens: {
    $gap: '8px',
    $radius: '6px',
    '$max-width': '720px',
    $font: '"Onest", system-ui, -apple-system, sans-serif',
    '$monospace-font': '"Source Code Pro", ui-monospace, monospace',
    '$default-font-size': '15px',
    '$default-line-height': 1.5,
    '$default-font-weight': '400',
    ...typographyTokens,
    ...colorTokens,
  },
  replaceTokens: {
    '$content-width': '$max-width',
  },
});
