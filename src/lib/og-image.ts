import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import type { ReactNode } from 'react';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

let fontDataCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontDataCache) return fontDataCache;

  const res = await fetch(
    'https://fonts.googleapis.com/css2?family=Onest:wght@700&display=swap',
  );
  const css = await res.text();
  const fontUrl = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
  if (!fontUrl) throw new Error('Could not extract font URL from Google Fonts');

  const fontRes = await fetch(fontUrl);
  fontDataCache = await fontRes.arrayBuffer();
  return fontDataCache;
}

export async function generateOgImage(element: ReactNode): Promise<Uint8Array> {
  const fontData = await loadFont();

  const svg = await satori(element, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      {
        name: 'Onest',
        data: fontData,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: OG_WIDTH },
  });

  return new Uint8Array(resvg.render().asPng());
}

export function ogCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        width: '100%',
        height: '100%',
        padding: '60px 80px',
        background: 'linear-gradient(135deg, #1a1e2e 0%, #0f1219 100%)',
        fontFamily: 'Onest',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: title.length > 40 ? '48px' : '56px',
                    fontWeight: 700,
                    color: '#f0f2f5',
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                  },
                  children: title,
                },
              },
              ...(subtitle
                ? [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '24px',
                          color: '#8b95a8',
                          lineHeight: 1.4,
                        },
                        children: subtitle,
                      },
                    },
                  ]
                : []),
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '24px',
                    fontSize: '20px',
                    color: '#5b8def',
                  },
                  children: 'tenphi.me',
                },
              },
            ],
          },
        },
      ],
    },
  };
}
