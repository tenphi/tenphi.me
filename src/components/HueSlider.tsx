import { tasty, useRawCSS } from '@tenphi/tasty';

// 18 discrete hue steps for the JS-free version. Each step is the center of an
// equal segment across the 0–360 wheel: (i + 0.5) * 20 = 10, 30, … 350.
const STEP_COUNT = 18;
const STEPS = Array.from({ length: STEP_COUNT }, (_, i) => i * 20 + 10);
const DEFAULT_HUE = 210;

const RAINBOW =
  'linear-gradient(to right, okhst(0 70% 60%), okhst(60 70% 60%), okhst(120 70% 60%), okhst(180 70% 60%), okhst(240 70% 60%), okhst(300 70% 60%), okhst(360 70% 60%))';

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

    // The thumb's size. The native thumb (the invisible drag handle) is 2bw
    // narrower, so the Knob, centered on it, reaches 1bw past each end of the
    // rail at 0 and 360 and covers its rounded end caps.
    '$knob-width': '3.75x',
    '$knob-height': '2.75x',
    '$handle-width': '($knob-width - 2bw)',

    // The thumb is being pressed: on the native slider, or on a segment of
    // the CSS-only track.
    '@thumb-pressed':
      ':has([data-hue-slider]:active) | :has([data-element="Option"]:active)',

    // Holds the track (either kind) and the Knob over it, and draws the rail:
    // a thin plain rainbow pill, centered. Both tracks are clear and as tall
    // as the thumb, so they're easy to grab.
    Field: {
      position: 'relative',
    },
    Rail: {
      $: 'Field::before',
      content: '""',
      position: 'absolute',
      inset: '((100% - 1.5x) / 2) 0',
      radius: 'round',
      image: RAINBOW,
      pointerEvents: 'none',
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
      height: '$knob-height',
      radius: 'round',
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
      position: 'relative',
      width: '100%',
      height: '$knob-height',
      margin: 0,
      appearance: 'none',
      radius: 'round',
      border: 'none',
      fill: '#clear',
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
      width: '$handle-width',
      height: '$knob-height',
      opacity: '0',
      cursor: 'pointer',
    },
    MozTrack: {
      $: 'Slider::-moz-range-track',
      fill: '#clear',
      border: 'none',
    },
    MozThumb: {
      $: 'Slider::-moz-range-thumb',
      width: '$handle-width',
      height: '$knob-height',
      border: 'none',
      opacity: '0',
      cursor: 'pointer',
    },

    // --- The thumb: a white pill that turns to glass while dragged --------
    // Like macOS sliders: at rest a solid white pill (in dark mode too); while
    // pressed it grows and turns into clear glass that shows the rainbow
    // through it, with a bright rim, some inner depth and a deeper shadow.
    // It's a real element, not the native thumb, so it can be glass. It
    // follows `--primary-hue`, which the checked radio (no JS) or the slider
    // (JS) sets, and ignores the pointer, so the track under it gets it.
    Knob: {
      recipe: 'glass',
      position: 'absolute',
      // Centered on the radio's segment without JS; on the native thumb
      // (its travel is the track minus its width) with JS.
      inset: {
        '': '50% top, (100% * $primary-hue / 360 - $knob-width / 2) left',
        '@root([data-js])':
          '50% top, (($handle-width - $knob-width) / 2 + (100% - $handle-width) * $primary-hue / 360) left',
      },
      translate: '0 -50%',
      width: '$knob-width',
      height: '$knob-height',
      radius: 'round',
      '#glass-fill': {
        '': '#white',
        '@thumb-pressed': '#white.15',
        '@thumb-pressed & @dark': '#surface.3',
        // High contrast keeps it solid.
        '@high-contrast': '#white',
      },
      // The edge derives from white, so the rim stays bright even when the
      // fill is clear; half see-through on the dark glass, so it doesn't glare.
      '#glass-edge': {
        '': '#white',
        '@thumb-pressed & @dark & !@high-contrast': '#white.5',
      },
      // Clear glass: a light blur that keeps the rainbow vivid.
      backdropFilter: {
        '': 'blur(0px) saturate(1)',
        '@thumb-pressed': 'blur(.25x) saturate(1.6)',
      },
      // The same layers in both states, so they animate: the drop shadow,
      // and the glass's inner highlight (top) and inner shade (bottom).
      shadow: {
        '': '0 .125x .375x color-mix(in oklab, #shadow 40%, #clear), 0 0 0 #clear inset, 0 0 0 #clear inset',
        '@thumb-pressed':
          '0 .5x 1.5x color-mix(in oklab, #shadow 80%, #clear), 0 1bw 1bw #white.6 inset, 0 -1bw 3bw #black.12 inset',
      },
      scale: {
        '': '1',
        '@thumb-pressed': '1.35',
        '@media(prefers-reduced-motion: reduce)': '1',
      },
      // Pressing springs it up quickly, with a slight overshoot; releasing
      // settles back more gently.
      '$knob-duration': {
        '': '200ms',
        '@thumb-pressed': '150ms',
        '@media(prefers-reduced-motion: reduce)': '0ms',
      },
      '$knob-easing': {
        '': 'ease-out',
        '@thumb-pressed': 'cubic-bezier(.3, 1.5, .5, 1)',
      },
      transition:
        'scale $knob-duration $knob-easing, ##glass-fill $knob-duration, ##glass-edge $knob-duration, shadow $knob-duration, backdrop-filter $knob-duration',
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
