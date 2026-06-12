import { useGlobalStyles, useRawCSS } from '@tenphi/tasty';

export default function GlobalStyles() {
  useRawCSS(`
    @view-transition {
      navigation: auto;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    img { max-width: 100%; height: auto; display: block; }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `);

  useGlobalStyles('html', {
    font: true,
    color: '#text',
    fill: '#surface',
    containerType: 'scroll-state',
    containerName: 'page',
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale',
  });

  useGlobalStyles('body', {
    preset: 't2',
    margin: '0',
    padding: '0',
  });

  return null;
}
