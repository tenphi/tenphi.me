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

    // --- CSS-only radio track (shown when JS is absent) --------------------
    // A row of full-height <label> segments over the rainbow. Each label wraps
    // a visually hidden radio; the checked radio drives `--primary-hue` through
    // the `:root:has(...)` rules emitted below. Hidden once `data-js` is set.
    Track: {
      display: {
        '': 'flex',
        '@root([data-js])': 'none',
      },
      flow: 'row',
      position: 'relative',
      width: '100%',
      height: '2x',
      radius: '1r',
      image: RAINBOW,
      outline: {
        '': 'none',
        ':has(input:focus-visible)': '2bw solid #focus / 1bw',
      },
    },
    Option: {
      $: 'label',
      position: 'relative',
      flexGrow: 1,
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
    Thumb: {
      width: '14px',
      height: '14px',
      radius: '50%',
      fill: '#surface',
      border: '2px solid #text',
      opacity: {
        '': '0',
        '@own(:is(input:checked ~ *))': '1',
        '@own(:is(input:focus-visible ~ *))': '1',
      },
    },

    // --- Native range slider (shown when JS is present) -------------------
    Slider: {
      $: 'input[type="range"]',
      display: {
        '': 'none',
        '@root([data-js])': 'block',
      },
      width: '100%',
      height: '2x',
      appearance: 'none',
      radius: '1r',
      image: RAINBOW,
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
    WebkitThumb: {
      $: 'Slider::-webkit-slider-thumb',
      '-webkit-appearance': 'none',
      appearance: 'none',
      width: '14px',
      height: '14px',
      radius: '50%',
      fill: '#surface',
      border: '2px solid #text',
      cursor: 'pointer',
    },
    MozThumb: {
      $: 'Slider::-moz-range-thumb',
      width: '14px',
      height: '14px',
      radius: '50%',
      fill: '#surface',
      border: '2px solid #text',
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
