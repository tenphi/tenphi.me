import { glaze } from '@tenphi/glaze';

const blue = glaze(210, 70);

blue.colors({
  surface: { lightness: 100, saturation: 0.08 },
  'surface-2': {
    base: 'surface',
    lightness: '-3',
    saturation: 0.12,
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
    saturation: 0.85,
  },
  'accent-text-hover': {
    base: 'surface',
    lightness: 40,
    contrast: ['AA', 'AAA'],
    saturation: 0.9,
  },
});

export const colorTokens = blue.tasty({
  states: {
    dark: ':has([data-theme-switcher][data-theme="dark"])',
    highContrast: ':has([data-contrast-switcher][data-contrast="more"])',
  },
});
