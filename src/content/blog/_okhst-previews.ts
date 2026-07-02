/**
 * Build-time color computation for the OKHST blog post's `Preview` blocks.
 *
 * Colors are precomputed with Glaze (OKHST) so the MDX can hand finished
 * HTML/CSS strings to the `Preview` component without shipping a JS runtime.
 * `lightTone: false` disables the default 10–100 tone window so authored tone
 * maps 1:1 to OKHSL lightness — this keeps the swatches aligned with the
 * contrast values quoted in the post.
 */
import { glaze } from '@tenphi/glaze';

function neutral(t: number): string {
  return glaze.format(
    glaze
      .color({ hue: 250, saturation: 0, tone: t }, { lightTone: false })
      .resolve().light,
    'rgb',
  );
}

function chroma(t: number, s: number): string {
  return glaze.format(
    glaze
      .color({ hue: 250, saturation: s, tone: t }, { lightTone: false })
      .resolve().light,
    'rgb',
  );
}

function relLuminance(rgb: [number, number, number]): number {
  const lin = rgb.map((c) => {
    const x = c / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
}

/** WCAG contrast of a neutral swatch against black. */
function contrastVsBlack(rgbStr: string): number {
  const m = rgbStr.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
  const y = relLuminance([m[0]!, m[1]!, m[2]!]);
  return (y + 0.05) / 0.05;
}

/** WCAG contrast of a neutral swatch against white. */
function contrastVsWhite(rgbStr: string): number {
  const m = rgbStr.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
  const y = relLuminance([m[0]!, m[1]!, m[2]!]);
  return 1.05 / (y + 0.05);
}

function formatContrast(ratio: number): string {
  if (ratio >= 10) return ratio.toFixed(0);
  if (ratio >= 2) return ratio.toFixed(2);
  return ratio.toFixed(2).replace(/\.?0+$/, '') || '1';
}

function formatMultiplier(ratio: number): string {
  return ratio.toFixed(2).replace(/\.?0+$/, '') || '1';
}

// --- Preview: tone ramp — step multipliers + vs black / vs white -----------
const toneSteps = [0, 20, 40, 60, 80, 100];

const toneCells = toneSteps.map((t) => {
  const bg = neutral(t);
  return {
    t,
    bg,
    vsBlack: contrastVsBlack(bg),
    vsWhite: contrastVsWhite(bg),
  };
});

function toneRampParts(): string {
  const swatchParts: string[] = [];
  const readParts: string[] = [];

  for (let i = 0; i < toneCells.length; i++) {
    const c = toneCells[i]!;
    swatchParts.push(
      `<div class="cell"><div class="swatch" style="--bg:${c.bg}"><span class="tone">t=${c.t}</span></div></div>`,
    );
    readParts.push(`<div class="cell"><div class="reads">
    <span class="read"><span class="read-k">blk</span> ${formatContrast(c.vsBlack)}:1</span>
    <span class="read"><span class="read-k">wht</span> ${formatContrast(c.vsWhite)}:1</span>
  </div></div>`);

    if (i < toneCells.length - 1) {
      const next = toneCells[i + 1]!;
      const mult = next.vsBlack / c.vsBlack;
      swatchParts.push(
        `<div class="step" title="Contrast vs black, step ${c.t}→${next.t}">×${formatMultiplier(mult)}</div>`,
      );
      readParts.push(`<div class="step-spacer" aria-hidden="true"></div>`);
    }
  }

  return `<div class="swatch-row">${swatchParts.join('')}</div><div class="reads-row">${readParts.join('')}</div>`;
}

export const toneSwatchesHtml = `<div class="ramp">${toneRampParts()}</div>`;

export const toneSwatchesCss = `
  .ramp { overflow-x: auto; }
  .swatch-row,
  .reads-row {
    display: flex;
    align-items: center;
    gap: 0;
    min-width: min(100%, 36rem);
  }
  .reads-row {
    align-items: flex-start;
    margin-top: 0.35rem;
  }
  .cell {
    flex: 1 1 0;
    min-width: 3.25rem;
  }
  .swatch {
    --bg: #808080;
    aspect-ratio: 4 / 3;
    border-radius: var(--radius, 6px);
    background: var(--bg);
    border: 1px solid var(--border-color, rgba(0, 0, 0, 0.12));
    display: flex;
    align-items: center;
    justify-content: center;
    font: 600 0.75rem/1 ui-monospace, monospace;
  }
  .swatch .tone {
    color: #fff;
    text-shadow:
      0 0 0.35em rgba(0, 0, 0, 0.55),
      0 1px 2px rgba(0, 0, 0, 0.45);
  }
  @supports (color: contrast-color(red)) {
    .swatch .tone {
      color: contrast-color(var(--bg));
      text-shadow: none;
    }
  }
  .reads {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    font: 500 0.62rem/1.35 ui-monospace, monospace;
    color: var(--text-soft-color, rgba(0, 0, 0, 0.55));
    text-align: center;
  }
  .read-k {
    opacity: 0.72;
  }
  .step {
    flex: 0 0 1.75rem;
    text-align: center;
    font: 700 0.65rem/1 ui-monospace, monospace;
    color: var(--accent-text-color, #2563eb);
    white-space: nowrap;
  }
  .step-spacer {
    flex: 0 0 1.75rem;
  }
`;

// --- Preview: pure-CSS experiment swatch ramp ------------------------------
// Background tone comes from the swatch index; text tone is inverted
// (100 - t); text saturation is reduced relative to the source saturation.
const rampToneSteps = [0, 20, 40, 60, 80, 100];
const rampSat = 70;

export const rampHtml = `<div class="ramp">${rampToneSteps
  .map((t) => {
    const bg = chroma(t, rampSat);
    return `<div class="swatch" style="--bg:${bg}">t=${t}</div>`;
  })
  .join('')}</div>`;

export const rampCss = `
  .ramp { display: flex; gap: .5rem; flex-wrap: wrap; }
  .swatch {
    --bg: #808080;
    flex: 1 1 0;
    min-width: 3.75rem;
    aspect-ratio: 1;
    border-radius: var(--radius, 6px);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
    color: #fff;
    border: 1px solid var(--border-color, rgba(0,0,0,.12));
    font: 600 .75rem/1 ui-monospace, monospace;
  }
  @supports (color: contrast-color(red)) {
    .swatch {
      color: contrast-color(var(--bg));
    }
  }
`;
