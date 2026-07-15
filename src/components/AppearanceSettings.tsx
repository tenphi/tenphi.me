import { tasty } from '@tenphi/tasty';
import { IconPalette } from '@tabler/icons-react';
import ThemeSwitcher from './ThemeSwitcher';
import HighContrastSwitcher from './HighContrastSwitcher';
import HueSlider from './HueSlider';
import Divider from './ui/Divider';

const AppearanceSettingsEl = tasty({
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
      image: {
        '': 'linear-gradient(to bottom, #surface.75, #surface-down.1)',
        '@high-contrast': 'none',
        '@own(:active) | :focus-within':
          'linear-gradient(to bottom, #surface-down.1, #surface.75)',
        '[data-collapsed]':
          'linear-gradient(to bottom, #surface.75, #surface-down.1)',
        '[data-collapsed] & @own(:active)':
          'linear-gradient(to bottom, #surface-down.1, #surface.75)',
      },
      transition: 'color 0.15s, fill 0.15s, image 0.15s',
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
      display: 'flex',
      flow: 'column',
      // The panel itself is focusable (`tabindex="-1"`) so clicking inert
      // regions inside it (padding, dividers, label text) focuses the panel
      // rather than blurring to <body> and collapsing `:focus-within`. It stays
      // out of the tab order and shows no ring (mouse focus isn't :focus-visible).
      outline: 'none',
      // Pure-CSS disclosure: a bare pseudo-class in a sub-element resolves
      // against the root component, so this shows the popover whenever focus
      // lives inside the relative root (the palette button or any control in
      // the panel). No JavaScript is required to open it. We toggle
      // `visibility` (not `display`) so the flex layout stays column during the
      // discrete exit — an absolutely positioned, hidden panel is still removed
      // from tab order and pointer events.
      // `[data-collapsed]` (a bare attr resolves against the root component) is
      // the JS-only "explicitly dismissed" state: it force-closes the panel even
      // while the trigger keeps focus, so Escape / a second click can close it
      // without moving focus off the button. No-JS behaviour is unchanged.
      visibility: {
        '': 'hidden',
        ':focus-within': 'visible',
        '[data-collapsed]': 'hidden',
      },
      // Slide 8px down out of the button + fade. `visibility` is transitioned
      // via `allow-discrete` so the panel stays visible through the fade-out,
      // and `@starting` seeds the entry values so both directions animate
      // without JS.
      opacity: {
        '': '0',
        ':focus-within': '1',
        ':focus-within & @starting': '0',
        '[data-collapsed]': '0',
      },
      translate: {
        '': '0 -8px',
        ':focus-within': '0 0',
        ':focus-within & @starting': '0 -8px',
        '[data-collapsed]': '0 -8px',
        // Respect reduced-motion: fade only, no vertical slide.
        '@media(prefers-reduced-motion: reduce)': '0 0',
      },
      // Open instantly; delay the close by 150ms. Clicking a <label> inside
      // (e.g. a hue swatch) blurs the active element for ~1 frame before the
      // radio gains focus, so `:focus-within` briefly flips off. The delayed
      // close means that transient blur never starts animating out — a refocus
      // within the window cancels it, eliminating the open/close flicker.
      transition: {
        '': 'opacity 80ms 150ms, translate 80ms 150ms, visibility 80ms 150ms allow-discrete',
        ':focus-within': 'opacity 80ms, translate 80ms, visibility 80ms allow-discrete',
      },
      width: '260px',
      zIndex: 200,
    },
    Setting: {
      display: 'flex',
      flow: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1x',
    },
    Label: {
      preset: 'label',
      color: '#text-soft',
      whiteSpace: 'nowrap',
    },
  },
  elements: {
    Button: 'button',
    Popover: 'div',
    Setting: 'div',
    Label: 'div',
  },
});

export default function AppearanceSettings() {
  return (
    <AppearanceSettingsEl data-appearance>
      <AppearanceSettingsEl.Button
        type="button"
        data-appearance-button
        aria-label="Appearance settings"
        aria-haspopup="dialog"
        aria-controls="appearance-popover"
      >
        <IconPalette size={16} stroke={2} aria-hidden="true" />
      </AppearanceSettingsEl.Button>
      <AppearanceSettingsEl.Popover
        id="appearance-popover"
        role="dialog"
        aria-label="Appearance settings"
        tabIndex={-1}
      >
        <HueSlider />
        <Divider margin="0" />
        <AppearanceSettingsEl.Setting>
          <AppearanceSettingsEl.Label>Theme</AppearanceSettingsEl.Label>
          <ThemeSwitcher />
        </AppearanceSettingsEl.Setting>
        <Divider margin="0" />
        <AppearanceSettingsEl.Setting>
          <AppearanceSettingsEl.Label>High contrast</AppearanceSettingsEl.Label>
          <HighContrastSwitcher />
        </AppearanceSettingsEl.Setting>
      </AppearanceSettingsEl.Popover>
    </AppearanceSettingsEl>
  );
}
