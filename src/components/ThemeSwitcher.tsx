import { tasty } from '@tenphi/tasty';
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';

const ThemeSwitcherEl = tasty({
  as: 'div',
  styles: {
    // A glass track with a raised glass chip on the selected option.
    recipe: 'glass',
    display: 'flex',
    flow: 'row',
    alignSelf: 'flex-start',
    padding: '.25x',
    radius: '1r',
    '#glass-fill': '#surface-2',
    outline: {
      '': 'none',
      ':has(input:focus-visible:focus-within)': '2bw solid #focus / 1bw',
    },

    Edge: { $: '&::before', recipe: 'glass-edge' },

    Option: {
      recipe: 'glass',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      // Keeps the switcher as tall as the appearance button (30px).
      padding: '(.5x + 1bw) .75x',
      // Concentric with the track's corners.
      radius: '(1r - .25x)',
      color: {
        '': '#text-soft',
        '@own(:hover)': '#text',
        '@own(:has(input:checked))': '#text',
      },
      // Unselected options are clear, which hides their edge too. Hover shows
      // a faint chip as a preview.
      '#glass-fill': {
        '': '#surface.0',
        '@own(:hover)': '#surface.5',
        '@own(:has(input:checked))': '#surface',
      },
      shadow: {
        '': '0 0 0 #clear',
        '@own(:has(input:checked))':
          '0 .125x .25x color-mix(in oklab, #shadow 30%, #clear)',
      },
      transition: 'color 0.15s, ##glass-fill 0.15s, shadow 0.15s',
      userSelect: 'none',
    },
    OptionEdge: { $: 'Option::before', recipe: 'glass-edge' },
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
