import { glaze } from '@tenphi/glaze';

const blue = glaze(210, 70);

blue.colors({
  surface: { lightness: 100, saturation: 0.08 },
  'surface-2': {
    base: 'surface',
    lightness: '-3',
    saturation: 0.12,
  },
  'surface-down': {
    base: 'surface',
    lightness: '-20',
    saturation: 0.12,
    mode: 'fixed',
  },
  text: {
    base: 'surface',
    lightness: 0,
    contrast: 'AAA',
    saturation: 0.06,
  },
  'text-soft': {
    base: 'surface',
    lightness: 20,
    contrast: ['AA', 'AAA'],
    saturation: 0.04,
  },
  border: {
    base: 'surface',
    lightness: ['-12', '-22'],
    saturation: 0.3,
  },
  'accent-text': {
    base: 'surface',
    lightness: 50,
    contrast: ['AA', 'AAA'],
    saturation: 80,
  },
  'accent-text-2': {
    base: 'surface-2',
    lightness: 50,
    contrast: ['AA', 'AAA'],
    saturation: 80,
  },
  'accent-surface': {
    base: 'accent-surface-text',
    lightness: '-48',
    contrast: ['AA', 7],
    saturation: 100,
    mode: 'fixed',
  },
  'accent-surface-text': {
    lightness: 100,
    mode: 'fixed',
  },
  'accent-surface-text-hover': {
    lightness: 90,
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
  bg: { lightness: 100, saturation: 0.1 },
  text: {
    base: 'bg',
    lightness: 0,
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

const palette = glaze.palette({ blue, syntax }, { primary: 'blue' });

export const colorTokens = palette.tasty({
  prefix: true,
  states: {
    dark: ':has(input[name="theme"][value="dark"]:checked) | (@media(prefers-color-scheme: dark) & :has(input[name="theme"][value="system"]:checked)',
  },
  modes: { highContrast: false },
});
