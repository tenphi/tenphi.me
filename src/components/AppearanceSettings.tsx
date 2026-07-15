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
      // The panel is "open" only when focus lives inside the root AND it hasn't
      // been explicitly dismissed. `[data-collapsed]` (a JS-only attr on the
      // root) is the dismissed state: Escape / a second click set it so the
      // panel closes even while the trigger keeps focus. Folding it into a
      // single open condition (rather than a separate override) is essential —
      // otherwise the closed opacity/translate values equal the base and get
      // deduped, so collapsing would only flip `visibility` (an instant jump
      // with no fade/slide). With the combined condition, collapsing falls back
      // to the genuine closed values and animates in both directions.
      visibility: {
        '': 'hidden',
        ':focus-within & !:is([data-collapsed])': 'visible',
      },
      // Slide 8px down out of the button + fade. `visibility` is transitioned
      // via `allow-discrete` so the panel stays visible through the fade-out.
      opacity: {
        '': '0',
        ':focus-within & !:is([data-collapsed])': '1',
      },
      translate: {
        '': '0 -8px',
        ':focus-within & !:is([data-collapsed])': '0 0',
        // Respect reduced-motion: fade only, no vertical slide.
        '@media(prefers-reduced-motion: reduce)': '0 0',
      },
      // Open instantly; delay the close by 150ms. Clicking a <label> inside
      // (e.g. a hue swatch) blurs the active element for ~1 frame before the
      // radio gains focus, so the open condition briefly flips off. The delayed
      // close means that transient blur never starts animating out — a refocus
      // within the window cancels it, eliminating the open/close flicker.
      transition: {
        '': 'opacity 80ms 150ms, translate 80ms 150ms, visibility 80ms 150ms allow-discrete',
        ':focus-within & !:is([data-collapsed])':
          'opacity 80ms, translate 80ms, visibility 80ms allow-discrete',
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
