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
    fontWeight: '700',
    boldFontWeight: '700',
  },
  h3: {
    fontSize: '20px',
    lineHeight: '1.4',
    fontWeight: '700',
    boldFontWeight: '700',
  },
  t1: {
    fontSize: '18px',
    lineHeight: '1.6',
    fontWeight: '400',
    boldFontWeight: '600',
  },
  t2: {
    fontSize: '16px',
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
    fontSize: '14px',
    lineHeight: '1.5',
    fontWeight: '500',
    boldFontWeight: '600',
    fontFamily: '"Source Code Pro", ui-monospace, monospace',
  },
  label: {
    fontSize: '13px',
    lineHeight: '1.4',
    fontWeight: '600',
    boldFontWeight: '700',
  },
  overline: {
    fontSize: '12px',
    lineHeight: '1.4',
    fontWeight: '600',
    boldFontWeight: '700',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
});

configure({
  states: {
    '@mobile': '@media(w < 640px)',
    '@tablet': '@media(640px <= w < 1024px)',
    '@desktop': '@media(w >= 1024px)',
    '@dark': '@root(:has(input[name="theme"][value="dark"]:checked)) | (@media(prefers-color-scheme: dark) & @root(:has(input[name="theme"][value="system"]:checked)))',
  },
  tokens: {
    $gap: '8px',
    $radius: '6px',
    '$card-radius': '12px',
    '$max-width': '720px',
    $font: '"Onest", system-ui, -apple-system, sans-serif',
    '$monospace-font': '"Source Code Pro", ui-monospace, monospace',
    '$default-font-size': '16px',
    '$default-line-height': 1.5,
    '$default-font-weight': '400',
    ...typographyTokens,
    ...colorTokens,
  },
  globalStyles: {
    body: {
      display: 'flex',
      flow: 'column',
      fill: '#surface-2',
      color: '#text',
      preset: 't2',
      margin: 0,
      padding: '2x',
      height: 'min 100dvh',
    },
  },
  replaceTokens: {
    '$content-width': '$max-width',
  },
});
