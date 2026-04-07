import { useGlobalStyles, useRawCSS } from '@tenphi/tasty';

export default function GlobalStyles() {
  useRawCSS(`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    img { max-width: 100%; height: auto; display: block; }
  `);

  useGlobalStyles('html', {
    font: true,
    color: '#text',
    fill: '#surface',
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale',
  });

  useGlobalStyles('body', {
    preset: 't2',
    margin: '0',
    padding: '0',
  });

  useGlobalStyles('code', {
    preset: 'code',
    fill: '#surface-2',
    padding: '0.15em 0.4em',
    radius: '.5r',
  });

  useGlobalStyles('pre', {
    fill: '#surface-2',
    padding: '2x',
    radius: '1r',
    overflow: 'auto',
  });

  useGlobalStyles('pre code', {
    fill: 'transparent',
    padding: '0',
  });

  return null;
}
