import { tasty } from '@tenphi/tasty';

// The harnesspm logo (assets/harnesspm.svg in the harnesspm repo), drawn
// inline so it follows the site's accent color: the tile has the tags' accent
// fill, and the layers have their text color. An <img> can't read the theme,
// so the hue slider, dark mode and high contrast wouldn't reach it.
const Logo = tasty({
  as: 'svg',
  styles: {
    display: 'block',
    color: '#accent-surface-text',

    Tile: { $: 'rect', svgFill: '#accent-surface' },
  },
});

const layer = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 4.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export default function HarnesspmLogo({ size = 48 }: { size?: number }) {
  return (
    <Logo viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <rect width="64" height="64" rx="15" />
      <path d="M15 40.5 32 49l17-8.5" strokeOpacity={0.62} {...layer} />
      <path d="M15 32 32 40.5 49 32" strokeOpacity={0.82} {...layer} />
      <path d="M32 14.5 49 23 32 31.5 15 23Z" {...layer} fill="currentColor" />
    </Logo>
  );
}
