import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { okhstToOkhsl, okhslToSrgb, srgbToHex } from '@tenphi/glaze';
import type { ReactNode } from 'react';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

/**
 * Build an OKHST tone ramp as sRGB hex colors — the same primitive the
 * article's playground renders, evaluated at build time for the poster.
 */
function okhstRamp(hue: number, saturation: number, steps: number): string[] {
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    const { h, s, l } = okhstToOkhsl({ h: hue, s: saturation, t });
    return srgbToHex(okhslToSrgb(h, s, l));
  });
}

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

export async function generateOgImage(element: ReactNode): Promise<Buffer> {
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

  return resvg.render().asPng();
}

/** Wrap PNG bytes in a Response with a binary-safe body for Astro's build. */
export function pngResponse(png: Buffer): Response {
  return new Response(new Blob([new Uint8Array(png)], { type: 'image/png' }), {
    headers: { 'Content-Type': 'image/png' },
  });
}

export function ogCard({
  title,
  subtitle,
  hue = 250,
  saturation = 0.7,
}: {
  title: string;
  subtitle?: string;
  hue?: number;
  saturation?: number;
}) {
  const ramp = okhstRamp(hue, saturation, 11);
  const accent = srgbToHex(
    okhslToSrgb(...okhstToneOkhsl(hue, saturation, 0.62)),
  );

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #1a1e2e 0%, #0f1219 100%)',
        fontFamily: 'Onest',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '220px',
            },
            children: ramp.map((color, i) => ({
              type: 'div',
              key: String(i),
              props: {
                style: {
                  display: 'flex',
                  flexGrow: 1,
                  height: '100%',
                  backgroundColor: color,
                },
              },
            })),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              flexGrow: 1,
              padding: '56px 80px',
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
                          marginTop: '16px',
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
                    color: accent,
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

/** OKHST (hue, saturation, tone) -> OKHSL tuple for `okhslToSrgb`. */
function okhstToneOkhsl(
  hue: number,
  saturation: number,
  tone: number,
): [number, number, number] {
  const { h, s, l } = okhstToOkhsl({ h: hue, s: saturation, t: tone });
  return [h, s, l];
}
