import { tasty, useRawCSS } from '@tenphi/tasty';

// 18 discrete hue steps for the JS-free version. Each step is the center of an
// equal segment across the 0–360 wheel: (i + 0.5) * 20 = 10, 30, … 350.
const STEP_COUNT = 18;
const STEPS = Array.from({ length: STEP_COUNT }, (_, i) => i * 20 + 10);
const DEFAULT_HUE = 210;

const RAINBOW_HUES = [0, 60, 120, 180, 240, 300, 360];

/**
 * The hue rainbow, left to right. `shift` moves every stop in OKLCH lightness
 * (e.g. `- $glass-edge-shade`), so a glass edge keeps each hue's own color.
 */
function rainbow(shift?: string) {
  const stops = RAINBOW_HUES.map((hue) => {
    const stop = `okhst(${hue} 70% 60%)`;
    return shift ? `oklch(from ${stop} calc(l ${shift}) c h)` : stop;
  });
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

// The rainbow track as glass. In JS mode the track is a native range input,
// which can't host the `::before` edge, so both modes draw the edge in a
// transparent 1bw border instead, with background layers clipped to the
// border box:
// - the fill gradient (a little darker toward the top and bottom) and the
//   rainbow, clipped to the padding box;
// - the edge: the rainbow lighter along the top and bottom and darker at the
//   ends, clipped to the border box. Layers can't fade into one another, so
//   the edge steps from the lighter rainbow (outer 20%) through the plain one
//   (to 35%) to the darker one (the middle), like the glass edge's gradient.
const TRACK_LAYERS = [
  [
    'linear-gradient(rgb(0 0 0 / .05), transparent 35%, transparent 65%, rgb(0 0 0 / .05))',
    'padding-box',
    '100% 100%',
    'top',
  ],
  [rainbow(), 'padding-box', '100% 100%', 'top'],
  [rainbow('+ $glass-edge-lift'), 'border-box', '100% 20%', 'top'],
  [rainbow('+ $glass-edge-lift'), 'border-box', '100% 20%', 'bottom'],
  [rainbow(), 'border-box', '100% 35%', 'top'],
  [rainbow(), 'border-box', '100% 35%', 'bottom'],
  [rainbow('- $glass-edge-shade'), 'border-box', '100% 100%', 'top'],
];
const TRACK_IMAGE = TRACK_LAYERS.map(([image]) => image).join(', ');
const TRACK_CLIP = TRACK_LAYERS.map(([, clip]) => clip).join(', ');
const TRACK_SIZE = TRACK_LAYERS.map(([, , size]) => size).join(', ');
const TRACK_POSITION = TRACK_LAYERS.map(([, , , position]) => position).join(
  ', ',
);

const HueSliderEl = tasty({
  as: 'div',
  styles: {
    display: 'flex',
    flow: 'column',
    gap: '.75x',

    Label: {
      preset: 'label',
      color: '#text-soft',
      whiteSpace: 'nowrap',
    },

    // The thumb's size; the native thumb matches it, so the glass Knob
    // tracks it exactly.
    '$knob-width': '3.75x',
    '$knob-height': '2.75x',

    // The thumb is being pressed: on the native slider, or on a segment of
    // the CSS-only track.
    '@thumb-pressed':
      ':has([data-hue-slider]:active) | :has([data-element="Option"]:active)',

    // Holds the track (either kind) and the Knob over it.
    Field: {
      position: 'relative',
    },

    // --- CSS-only radio track (shown when JS is absent) --------------------
    // A row of full-height <label> segments over the rainbow. Each label wraps
    // a visually hidden radio; the checked radio drives `--primary-hue` through
    // the `:root:has(...)` rules emitted below. Hidden once `data-js` is set.
    Track: {
      display: 'flex',
      hide: {
        '': false,
        '@root([data-js])': true,
      },
      flow: 'row',
      position: 'relative',
      width: '100%',
      height: '2x',
      radius: 'round',
      border: '#clear',
      image: TRACK_IMAGE,
      backgroundClip: TRACK_CLIP,
      backgroundOrigin: 'border-box',
      backgroundSize: TRACK_SIZE,
      backgroundPosition: TRACK_POSITION,
      backgroundRepeat: 'no-repeat',
      outline: {
        '': 'none',
        ':has(input:focus-visible)': '2bw solid #focus / 1bw',
      },
    },
    Option: {
      $: 'label',
      position: 'relative',
      flexGrow: 1,
      flexBasis: 0,
      width: 'min 0',
      height: '100%',
      cursor: 'pointer',
    },
    // Visually hidden radios — the accessible, stateful control.
    Radio: {
      $: 'input[type="radio"]',
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      border: 'none',
      opacity: '0',
    },

    // --- Native range slider (shown when JS is present) -------------------
    Slider: {
      $: 'input[type="range"]',
      display: 'block',
      hide: {
        '': true,
        '@root([data-js])': false,
      },
      width: '100%',
      height: '2x',
      appearance: 'none',
      radius: 'round',
      border: '#clear',
      image: TRACK_IMAGE,
      backgroundClip: TRACK_CLIP,
      backgroundOrigin: 'border-box',
      backgroundSize: TRACK_SIZE,
      backgroundPosition: TRACK_POSITION,
      backgroundRepeat: 'no-repeat',
      cursor: {
        '': 'pointer',
        '@own([disabled])': 'not-allowed',
      },
      opacity: {
        '': '1',
        '@own([disabled])': '.4',
      },
      outline: {
        '': 'none',
        '@own(:focus-visible)': '2bw solid #focus / 1bw',
      },
    },
    // The native thumb stays as the invisible drag handle; the Knob draws it.
    WebkitThumb: {
      $: 'Slider::-webkit-slider-thumb',
      '-webkit-appearance': 'none',
      appearance: 'none',
      width: '$knob-width',
      height: '$knob-height',
      opacity: '0',
      cursor: 'pointer',
    },
    MozThumb: {
      $: 'Slider::-moz-range-thumb',
      width: '$knob-width',
      height: '$knob-height',
      border: 'none',
      opacity: '0',
      cursor: 'pointer',
    },

    // --- The thumb: a glass lens over either track ------------------------
    // A real element, not the native thumb, so it can be glass: a slightly
    // see-through fill over a blurred backdrop, with the 1px glass edge. It
    // follows `--primary-hue`, which the checked radio (no JS) or the slider
    // (JS) sets, and ignores the pointer, so the track under it gets it.
    Knob: {
      recipe: 'glass',
      position: 'absolute',
      // Centered on the radio's segment without JS; where the native thumb
      // sits (its travel is the track minus its width) with JS.
      inset: {
        '': '50% top, (1bw + (100% - 2bw) * $primary-hue / 360 - $knob-width / 2) left',
        '@root([data-js])':
          '50% top, (1bw + (100% - 2bw - $knob-width) * $primary-hue / 360) left',
      },
      translate: '0 -50%',
      width: '$knob-width',
      height: '$knob-height',
      radius: 'round',
      '#glass-fill': '#surface.5',
      // The fill is see-through, so the edge derives from an opaque color:
      // the surface in light mode, white in dark mode, where the dark lens
      // would otherwise blend into the rainbow.
      '#glass-edge': {
        '': '#surface',
        '@dark': '#white',
      },
      backdropFilter: 'blur(.5x)',
      // While pressed, the lens grows a little and lifts.
      shadow: {
        '': '0 .125x .25x color-mix(in oklab, #shadow 30%, #clear)',
        '@thumb-pressed': '0 .25x .5x color-mix(in oklab, #shadow 30%, #clear)',
      },
      scale: {
        '': '1',
        '@thumb-pressed': '1.15',
        '@media(prefers-reduced-motion: reduce)': '1',
      },
      transition: 'scale 120ms ease-out, shadow 120ms',
      pointerEvents: 'none',
    },
    KnobEdge: { $: 'Knob::before', recipe: 'glass-edge' },
  },
  elements: {
    Label: 'div',
    Field: 'div',
    Track: 'div',
    Option: 'label',
    Slider: 'input',
    Knob: 'div',
  },
});

export default function HueSlider() {
  // Map each discrete radio value to the global `--primary-hue` custom
  // property. One rule per step; the checked radio wins in the cascade and
  // rotates the entire palette — no JavaScript involved. When JS is present it
  // sets `--primary-hue` inline on <html>, which overrides these rules.
  useRawCSS(
    STEPS.map(
      (hue) =>
        `:root:has(input[name="hue"][value="${hue}"]:checked){--primary-hue:${hue};}`,
    ).join('\n'),
  );

  return (
    <HueSliderEl>
      <HueSliderEl.Label id="hue-label">Select hue</HueSliderEl.Label>
      <HueSliderEl.Field>
        <HueSliderEl.Track
          role="radiogroup"
          aria-labelledby="hue-label"
          aria-orientation="horizontal"
        >
          {STEPS.map((hue) => (
            <HueSliderEl.Option key={hue}>
              <input
                type="radio"
                name="hue"
                value={hue}
                aria-label={`Hue ${hue} degrees`}
                defaultChecked={hue === DEFAULT_HUE}
              />
            </HueSliderEl.Option>
          ))}
        </HueSliderEl.Track>
        <HueSliderEl.Slider
          type="range"
          min="0"
          max="360"
          step="1"
          defaultValue={DEFAULT_HUE}
          data-hue-slider
          aria-label="Hue"
          aria-valuetext={`${DEFAULT_HUE} degrees`}
          disabled
        />
        <HueSliderEl.Knob aria-hidden="true" />
      </HueSliderEl.Field>
    </HueSliderEl>
  );
}
