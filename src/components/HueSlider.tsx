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
// border box (like the `glass-border` recipe):
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
      radius: '1r',
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
      // Equal segments, even though the thumb is wider than one: it overflows
      // its segment, centered.
      flexGrow: 1,
      flexBasis: 0,
      width: 'min 0',
      height: '100%',
      display: 'flex',
      placeContent: 'center',
      placeItems: 'center',
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
    // Slider-style thumb. Only the thumb after a checked (or focused) radio is
    // shown, so it reads exactly like the range thumb sitting on the track.
    // A glass bead (see the `glass-border` recipe).
    Thumb: {
      recipe: 'glass-border',
      '#glass-fill': '#surface',
      flexShrink: 0,
      width: '2.25x',
      height: '2.25x',
      radius: '50%',
      shadow: '0 .125x .25x color-mix(in oklab, #shadow 30%, #clear)',
      opacity: {
        '': '0',
        '@own(:is(input:checked ~ *))': '1',
        '@own(:is(input:focus-visible ~ *))': '1',
      },
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
      radius: '1r',
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
    // Glass beads, like the CSS-only Thumb.
    WebkitThumb: {
      $: 'Slider::-webkit-slider-thumb',
      recipe: 'glass-border',
      '-webkit-appearance': 'none',
      appearance: 'none',
      '#glass-fill': '#surface',
      boxSizing: 'border-box',
      width: '2.25x',
      height: '2.25x',
      radius: '50%',
      shadow: '0 .125x .25x color-mix(in oklab, #shadow 30%, #clear)',
      cursor: 'pointer',
    },
    MozThumb: {
      $: 'Slider::-moz-range-thumb',
      recipe: 'glass-border',
      '#glass-fill': '#surface',
      boxSizing: 'border-box',
      width: '2.25x',
      height: '2.25x',
      radius: '50%',
      shadow: '0 .125x .25x color-mix(in oklab, #shadow 30%, #clear)',
      cursor: 'pointer',
    },
  },
  elements: {
    Label: 'div',
    Track: 'div',
    Option: 'label',
    Thumb: 'div',
    Slider: 'input',
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
            <HueSliderEl.Thumb aria-hidden="true" />
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
    </HueSliderEl>
  );
}
