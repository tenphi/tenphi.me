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
    <AppearanceSettingsEl>
      <AppearanceSettingsEl.Button
        type="button"
        data-appearance-toggle
        aria-label="Appearance settings"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <IconPalette size={16} stroke={2} aria-hidden="true" />
      </AppearanceSettingsEl.Button>
      <AppearanceSettingsEl.Popover
        data-appearance-popover
        data-open="false"
        role="dialog"
        aria-label="Appearance settings"
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
