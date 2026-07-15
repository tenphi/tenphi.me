import { tasty } from '@tenphi/tasty';
import {
  IconContrast,
  IconContrastOff,
  IconDeviceDesktop,
} from '@tabler/icons-react';

const HighContrastSwitcherEl = tasty({
  as: 'div',
  styles: {
    display: 'flex',
    flow: 'row',
    alignSelf: 'flex-start',
    border: true,
    radius: '1r',
    overflow: 'hidden',
    outline: {
      '': 'none',
      ':has(input:focus-visible:focus-within)': '2bw solid #focus / 1bw',
    },

    Option: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '.75x',
      color: {
        '': '#text-soft',
        '@own(:hover)': '#text',
        '@own(:has(input:checked))': '#text',
      },
      fill: {
        '': '#surface-2',
        '@own(:has(input:checked))': '#surface',
      },
      shadow: {
        '': 'inset 0 0 .5x #small-shadow.0',
        '@own(:has(input:checked))': 'inset 0 0 .5x #small-shadow',
      },
      transition: 'color 0.15s, fill 0.15s',
      userSelect: 'none',
      border: {
        '': '#border left',
        '@own(:first-child)': 'none',
      },
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
