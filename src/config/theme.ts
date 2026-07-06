import { glaze } from '@tenphi/glaze';

const primary = glaze(210, 100, { pastel: true });

primary.colors({
  surface: { tone: 100, saturation: 0.056 },
  'surface-2': {
    base: 'surface',
    tone: '-4',
    saturation: 0.084,
  },
  'surface-down': {
    base: 'surface',
    tone: '-20',
    saturation: 0.084,
    mode: 'fixed',
  },
  text: {
    base: 'surface',
    tone: 0,
    contrast: 'AAA',
    saturation: 0.042,
  },
  'text-soft': {
    base: 'surface',
    tone: 20,
    contrast: ['AA', 'AAA'],
    saturation: 0.028,
  },
  border: {
    base: 'surface',
    tone: ['-12', '-22'],
    saturation: 0.21,
  },
  'accent-text': {
    base: 'surface',
    tone: 50,
    contrast: ['AA', 'AAA'],
    saturation: 80,
  },
  'accent-text-2': {
    base: 'surface-2',
    tone: 50,
    contrast: ['AA', 'AAA'],
    saturation: 80,
  },
  'accent-surface': {
    base: 'accent-surface-text',
    tone: '-48',
    contrast: ['AA', 7],
    saturation: 100,
    mode: 'fixed',
  },
  'accent-surface-text': {
    tone: 100,
    mode: 'fixed',
  },
  'accent-surface-text-hover': {
    tone: 90,
    mode: 'fixed',
  },
  shadow: {
    type: 'shadow',
    bg: 'surface',
    intensity: 5,
  },
  'small-shadow': {
    type: 'shadow',
    bg: 'surface',
    intensity: 15,
  },
  'tiny-shadow': {
    type: 'shadow',
    bg: 'accent-surface',
    fg: 'surface',
    intensity: 20,
  },
});

const syntax = glaze(210, 90);

syntax.colors({
  bg: { tone: 100, saturation: 0.1 },
  text: {
    base: 'bg',
    tone: 0,
    contrast: 'AAA',
    saturation: 0,
  },
  comment: {
    base: 'bg',
    contrast: ['AA', 'AAA'],
    saturation: 0.01,
    hue: 210,
  },
  punctuation: {
    base: 'bg',
    contrast: ['AA', 'AAA'],
    saturation: 0.01,
    hue: 210,
  },
  keyword: {
    base: 'bg',
    contrast: ['AA', 'AAA'],
    saturation: 0.65,
  },
  string: {
    base: 'bg',
    contrast: ['AA', 'AAA'],
    saturation: 0.55,
    hue: 15,
  },
  token: {
    base: 'bg',
    contrast: ['AA', 'AAA'],
    saturation: 0.55,
    hue: 125,
  },
  property: {
    base: 'bg',
    contrast: ['AA', 'AAA'],
    saturation: 0.55,
    hue: 155,
  },
  number: {
    base: 'bg',
    contrast: ['AA', 'AAA'],
    saturation: 0.6,
    hue: 70,
  },
  function: {
    base: 'bg',
    contrast: ['AA', 'AAA'],
    saturation: 0.55,
    hue: 210,
  },
  value: {
    base: 'bg',
    contrast: ['AA', 'AAA'],
    saturation: 0.5,
    hue: 210,
  },
  operator: {
    base: 'bg',
    contrast: ['AA', 'AAA'],
    saturation: 0.5,
    hue: 340,
  },
});

const STATES = {
  dark: ':has(input[name="theme"][value="dark"]:checked) | (@media(prefers-color-scheme: dark) & :has(input[name="theme"][value="system"]:checked)',
};
const MODES = { highContrast: false };

// --- Primary palette: pastel + splitHue -----------------------------------
// Glaze emits oklch colors referencing `var(--primary-hue)` plus a
// `$primary-hue` token. Registered through `configure({ tokens })` alongside
// the syntax tokens; Tasty preserves `var()` inside the oklch color values,
// so a single `--primary-hue` CSS var rotates the whole UI palette.
const primaryPalette = glaze.palette({ primary }, { primary: 'primary' });
const primaryTokens = primaryPalette.tasty({
  prefix: true,
  splitHue: true,
  states: STATES,
  modes: MODES,
});

// --- Syntax palette: non-pastel, no splitHue ------------------------------
// Full saturation for readability, inline colors (no hue rotation). Used for
// code highlighting (shiki theme references `--syntax-*-color`).
const syntaxPalette = glaze.palette({ syntax });
const syntaxTokens = syntaxPalette.tasty({
  prefix: true,
  primary: false,
  states: STATES,
  modes: MODES,
});

// All tokens registered with Tasty at runtime (primary + syntax).
export const colorTokens = { ...primaryTokens, ...syntaxTokens };
