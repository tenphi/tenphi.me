import { tasty } from '@tenphi/tasty';

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
    Slider: {
      $: 'input',
      width: '100%',
      height: '2x',
      appearance: 'none',
      radius: '1r',
      image:
        'linear-gradient(to right, okhst(0 70% 60%), okhst(60 70% 60%), okhst(120 70% 60%), okhst(180 70% 60%), okhst(240 70% 60%), okhst(300 70% 60%), okhst(360 70% 60%))',
      cursor: 'pointer',
    },
    // Slider thumb — vendor pseudo-elements on the Slider input. Use site
    // tokens so it adapts to light/dark and stays visible on the rainbow.
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
    Slider: 'input',
  },
});

export default function HueSlider() {
  return (
    <HueSliderEl>
      <HueSliderEl.Label>Select hue</HueSliderEl.Label>
      <HueSliderEl.Slider
        type="range"
        min="0"
        max="360"
        step="1"
        defaultValue={210}
        data-hue-slider
        aria-label="Hue"
      />
    </HueSliderEl>
  );
}
