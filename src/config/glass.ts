import type { ConfigTokens, RecipeStyles } from '@tenphi/tasty';

/**
 * Glass surfaces: a strict 1px edge ring in the surface's own fill color, plus
 * a soft fill gradient under it.
 *
 * - **Edge ring.** Lighter along the top and bottom, darker along the sides.
 *   Its colors are the fill moved up or down in OKLCH lightness
 *   (`$glass-edge-lift`, `$glass-edge-shade`), so the same ring reads on a
 *   near-white surface, a dark one and the accent fill, in both schemes.
 *   Blend modes can't do that: they act mostly on mid-tones, so they vanish
 *   on a near-white fill and overpower a saturated one.
 * - **Fill gradient.** The fill darkens a little toward the top and bottom
 *   (`$glass-fill-shade`), right where the ring is light, so the ring's light
 *   edges stand out against it.
 * - **One source of color.** The fill goes through the local `#glass-fill`
 *   token, so the ring and the gradient follow every fill state (hover,
 *   pressed, checked). Transition `##glass-fill` instead of `fill`: the token
 *   is a registered `<color>`, so everything derived from it animates too.
 *   A clear fill hides the ring, because the ring keeps the fill's alpha.
 * - **Translucent fills.** Set `#glass-edge` to an opaque color, so the ring
 *   stays a solid line. It defaults to the fill.
 *
 * Needs relative color syntax (Chrome 119+, Safari 18+, Firefox 128+). Older
 * browsers drop both gradients and show the plain fill.
 *
 * Usage — the surface recipe goes on the element, the edge recipe on its
 * `::before`:
 *
 * ```ts
 * styles: {
 *   recipe: 'glass',
 *   '#glass-fill': '#surface',
 *   Edge: { $: '&::before', recipe: 'glass-edge' },
 * }
 * ```
 *
 * For a sub-element, point the edge at it: `$: 'Icon::before'`.
 */

/**
 * Tokens that set how strong the glass is. They hold plain numbers, so they
 * resolve on :root safely. The colors can't live in tokens: a token that
 * reads `#glass-fill` would resolve it on :root too, not on the surface.
 */
export const GLASS_TOKENS: ConfigTokens = {
  /** How much lighter the top and bottom of the edge are than the fill */
  '$glass-edge-lift': {
    '': '.04',
    '@high-contrast': '.08',
  },
  /** How much darker the sides of the edge are than the fill */
  '$glass-edge-shade': {
    '': '.08',
    '@high-contrast': '.16',
  },
  /** How much the fill darkens toward the top and bottom, under the edge */
  '$glass-fill-shade': '.02',
};

// The ring: the edge color moved up or down in OKLCH lightness.
const EDGE_LIGHT = 'oklch(from #glass-edge calc(l + $glass-edge-lift) c h)';
const EDGE_DARK = 'oklch(from #glass-edge calc(l - $glass-edge-shade) c h)';
// The fill gradient: the fill a little darker, fading to the fill itself made
// transparent (a fade to it keeps the hue).
const FILL_DARK = 'oklch(from #glass-fill calc(l - $glass-fill-shade) c h)';
const FILL_CLEAR = 'oklch(from #glass-fill l c h / 0)';

export const GLASS_RECIPES: Record<string, RecipeStyles> = {
  /** A glass surface. Set its fill with `#glass-fill`. */
  glass: {
    // The edge (`::before`) is positioned against the surface.
    position: 'relative',
    '#glass-edge': '#glass-fill',
    fill: '#glass-fill',
    // Over the fill color, under the content and the edge.
    image: `linear-gradient(${FILL_DARK}, ${FILL_CLEAR} 35%, ${FILL_CLEAR} 65%, ${FILL_DARK})`,
  },
  /**
   * The 1px edge ring, for the surface's `::before`. It sits right over the
   * surface's outer pixel and inherits its radius. The mask cuts the padding
   * box out of a full-size layer, leaving a 1bw ring.
   */
  'glass-edge': {
    content: '""',
    position: 'absolute',
    inset: 0,
    padding: '1bw',
    radius: 'inherit',
    pointerEvents: 'none',
    image: `linear-gradient(${EDGE_LIGHT}, ${EDGE_DARK} 35%, ${EDGE_DARK} 65%, ${EDGE_LIGHT})`,
    mask: 'linear-gradient(white, white) content-box exclude, linear-gradient(white, white)',
  },
  /** Add to `glass` on an accent fill: it glows softly in its own color. */
  'glass-accent': {
    shadow: '0 0 1.5px #glass-fill',
  },
};
