import { tasty } from '@tenphi/tasty';
import { IconPalette } from '@tabler/icons-react';

const HueSwitcherEl = tasty({
  as: 'div',
  styles: {
    position: 'relative',
    Button: {
      $: 'button',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '.75x',
      cursor: 'pointer',
      radius: '1r',
      color: {
        '': '#text-soft',
        '@own(:hover)': '#text',
      },
      fill: '#surface-2',
      border: true,
      transition: 'color 0.15s, fill 0.15s',
    },
    Popover: {
      position: 'absolute',
      top: '100%',
      right: 0,
      margin: '1x 0',
      padding: '1x',
      gap: '.5x',
      fill: '#surface',
      border: true,
      radius: '1cr',
      shadow: '0 1x 2x #shadow',
      display: {
        '': 'none',
        '@own([data-open="true"])': 'flex',
      },
      flow: 'column',
      width: '200px',
      zIndex: 200,
    },
    Label: {
      preset: 'label',
      color: '#text-soft',
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
      $: '>Popover>Slider::-webkit-slider-thumb',
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
      $: '>Popover>Slider::-moz-range-thumb',
      width: '14px',
      height: '14px',
      radius: '50%',
      fill: '#surface',
      border: '2px solid #text',
      cursor: 'pointer',
    },
  },
  elements: {
    Button: 'button',
    Popover: 'div',
    Label: 'div',
    Slider: 'input',
  },
});

export default function HueSwitcher() {
  return (
    <HueSwitcherEl>
      <HueSwitcherEl.Button
        type="button"
        data-hue-toggle
        aria-label="Adjust hue"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <IconPalette size={16} stroke={2} aria-hidden="true" />
      </HueSwitcherEl.Button>
      <HueSwitcherEl.Popover
        data-hue-popover
        data-open="false"
        role="dialog"
        aria-label="Select hue"
      >
        <HueSwitcherEl.Label>Select hue</HueSwitcherEl.Label>
        <HueSwitcherEl.Slider
          type="range"
          min="0"
          max="360"
          step="1"
          defaultValue={210}
          data-hue-slider
          aria-label="Hue"
        />
      </HueSwitcherEl.Popover>
    </HueSwitcherEl>
  );
}
