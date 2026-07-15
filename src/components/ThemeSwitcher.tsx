import { tasty } from '@tenphi/tasty';
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';

const ThemeSwitcherEl = tasty({
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

export default function ThemeSwitcher() {
  return (
    <ThemeSwitcherEl role="radiogroup" aria-label="Color theme">
      <ThemeSwitcherEl.Option aria-label="System theme">
        <input
          type="radio"
          name="theme"
          value="system"
          aria-label="System theme"
          defaultChecked
        />
        <IconDeviceDesktop size={16} stroke={2} aria-hidden="true" />
      </ThemeSwitcherEl.Option>
      <ThemeSwitcherEl.Option aria-label="Light theme">
        <input
          type="radio"
          name="theme"
          value="light"
          aria-label="Light theme"
        />
        <IconSun size={16} stroke={2} aria-hidden="true" />
      </ThemeSwitcherEl.Option>
      <ThemeSwitcherEl.Option aria-label="Dark theme">
        <input type="radio" name="theme" value="dark" aria-label="Dark theme" />
        <IconMoon size={16} stroke={2} aria-hidden="true" />
      </ThemeSwitcherEl.Option>
    </ThemeSwitcherEl>
  );
}
