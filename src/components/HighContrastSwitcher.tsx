import { tasty } from '@tenphi/tasty';
import {
  IconContrast,
  IconContrastOff,
  IconDeviceDesktop,
} from '@tabler/icons-react';

const HighContrastSwitcherEl = tasty({
  as: 'div',
  styles: {
    // A glass pill track. The options inside aren't glass: the selected one
    // is a plain tint of the text color.
    recipe: 'glass',
    display: 'flex',
    flow: 'row',
    alignSelf: 'flex-start',
    // Options keep apart by the same 2px that keeps them off the track edge.
    gap: '.25x',
    padding: '.25x',
    radius: 'round',
    // Dark high contrast paints the surface pure black, like the panel, so
    // the track steps up a tone to stay visible.
    '#glass-fill': {
      '': '#surface',
      '@dark & @high-contrast': '#surface-2',
    },
    shadow: '0 .125x .25x color-mix(in oklab, #shadow 30%, #clear)',
    outline: {
      '': 'none',
      ':has(input:focus-visible:focus-within)': '2bw solid #focus / 1bw',
    },

    Edge: { $: '&::before', recipe: 'glass-edge' },

    Option: {
      position: 'relative',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      // Keeps the switcher as tall as the appearance button (30px).
      padding: '(.5x + 1bw) 1x',
      radius: 'round',
      color: {
        '': '#text-soft',
        '@own(:hover)': '#text',
        '@own(:has(input:checked))': '#text',
      },
      fill: {
        '': '#clear',
        '@own(:hover)': '#text.04',
        '@own(:has(input:checked))': '#text.08',
        '@own(:has(input:checked)) & @high-contrast': '#text.16',
      },
      transition: 'color 0.15s, fill 0.15s',
      userSelect: 'none',
    },
    Input: {
      $: 'input',
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
  },
  elements: {
    Option: 'label',
  },
});

export default function HighContrastSwitcher() {
  return (
    <HighContrastSwitcherEl role="radiogroup" aria-label="High contrast">
      <HighContrastSwitcherEl.Option aria-label="System high contrast">
        <input
          type="radio"
          name="highContrast"
          value="system"
          aria-label="System high contrast"
          defaultChecked
        />
        <IconDeviceDesktop size={16} stroke={2} aria-hidden="true" />
      </HighContrastSwitcherEl.Option>
      <HighContrastSwitcherEl.Option aria-label="High contrast off">
        <input
          type="radio"
          name="highContrast"
          value="off"
          aria-label="High contrast off"
        />
        <IconContrastOff size={16} stroke={2} aria-hidden="true" />
      </HighContrastSwitcherEl.Option>
      <HighContrastSwitcherEl.Option aria-label="High contrast on">
        <input
          type="radio"
          name="highContrast"
          value="on"
          aria-label="High contrast on"
        />
        <IconContrast size={16} stroke={2} aria-hidden="true" />
      </HighContrastSwitcherEl.Option>
    </HighContrastSwitcherEl>
  );
}
