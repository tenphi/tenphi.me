import { configure, generateTypographyTokens } from '@tenphi/tasty';

import { colorTokens } from './theme';

const typographyTokens = generateTypographyTokens({
  h1: {
    fontSize: {
      '': '36px',
      '@mobile': '32px',
    },
    lineHeight: '1.15',
    letterSpacing: '-0.015em',
    fontWeight: '700',
    boldFontWeight: '700',
  },
  h2: {
    fontSize: '26px',
    lineHeight: '1.25',
    letterSpacing: '-0.005em',
    fontWeight: '700',
    boldFontWeight: '700',
  },
  h3: {
    fontSize: '21px',
    lineHeight: '1.35',
    letterSpacing: '0',
    fontWeight: '700',
    boldFontWeight: '700',
  },
  t1: {
    fontSize: '18px',
    lineHeight: '1.6',
    fontWeight: '420',
    boldFontWeight: '600',
  },
  t2: {
    fontSize: '16px',
    lineHeight: '1.5',
    fontWeight: '420',
    boldFontWeight: '600',
  },
  prose: {
    fontSize: '17px',
    lineHeight: '1.7',
    fontWeight: '420',
    boldFontWeight: '600',
  },
  t3: {
    fontSize: '13px',
    lineHeight: '1.5',
    fontWeight: '420',
    boldFontWeight: '600',
  },
  nav: {
    fontSize: '15px',
    lineHeight: '1.4',
    fontWeight: '420',
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
    '@dark':
      '@root(:has(input[name="theme"][value="dark"]:checked)) | (@media(prefers-color-scheme: dark) & @root(:has(input[name="theme"][value="system"]:checked)))',
    '@high-contrast':
      '@root(:has(input[name="highContrast"][value="on"]:checked)) | (@media(prefers-contrast: more) & @root(:has(input[name="highContrast"][value="system"]:checked)))',
  },
  units: {
    // Matches the project icon tile (1r + 1x), so cards share its rounding.
    cr: '14px',
  },
  tokens: {
    $gap: '8px',
    $radius: '6px',
    '$card-radius': '1cr',
    '$max-width': '760px',
    '$prose-width': '720px',
    '$font-sans': '"Onest", system-ui, -apple-system, sans-serif',
    '$font-mono': '"Source Code Pro", ui-monospace, monospace',
    '$default-font-size': '16px',
    '$default-line-height': 1.5,
    '$default-font-weight': '400',
    ...typographyTokens,
    ...colorTokens,
    // Glass edge: a dark shade along the sides and a light tint along the top
    // and bottom. High contrast strengthens whichever layer is faint in the
    // current scheme (the shade in light mode, the tint in dark mode).
    '#glass-shade': {
      '': 'rgba(0 0 0 / .1)',
      '@high-contrast': 'rgba(0 0 0 / .4)',
      '@dark': 'rgba(0 0 0 / .8)',
    },
    '#glass-tint': {
      '': 'rgba(255 255 255 / .8)',
      '@dark': 'rgba(255 255 255 / .1)',
      '@dark & @high-contrast': 'rgba(255 255 255 / .4)',
    },
    '$glass-shade':
      '.5px 0 .5px #glass-shade inset, -.5px 0 .5px #glass-shade inset',
    '$glass-tint': '0 1px 1px #glass-tint inset, 0 -1px 1px #glass-tint inset',
    '$glass-shadow': '$glass-shade, $glass-tint',
    // Accent fills keep the same color in both schemes, so their edge layers
    // can't follow the page: the light-mode tint glares on them and the
    // dark-mode shade outlines them in black. Separate layers are needed
    // because `$glass-shade` and `$glass-tint` resolve their colors on :root,
    // so overriding the colors on an element would not reach them.
    '#glass-accent-shade': {
      '': 'rgba(0 0 0 / .3)',
      '@high-contrast': 'rgba(0 0 0 / .6)',
    },
    '#glass-accent-tint': {
      '': 'rgba(255 255 255 / .3)',
      '@dark': '#glass-tint',
    },
    '$glass-accent-shade':
      '.5px 0 .5px #glass-accent-shade inset, -.5px 0 .5px #glass-accent-shade inset',
    '$glass-accent-tint':
      '0 1px 1px #glass-accent-tint inset, 0 -1px 1px #glass-accent-tint inset',
    '$glass-accent-shadow': '$glass-accent-shade, $glass-accent-tint',
    '#scrollbar-thumb': '#border',
    '#scrollbar-track': '#border.4',
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
    code: {
      preset: 'code',
    },
    a: {
      fontWeight: '600',
      radius: '1r',
      outline: {
        '': 'none',
        ':focus-visible': '2bw solid #focus / 1bw',
      },
    },
    button: {
      radius: '1r',
      outline: {
        '': 'none',
        ':focus-visible': '2bw solid #focus / 1bw',
      },
    },
  },
  replaceTokens: {
    '$content-width': '$max-width',
  },
});
