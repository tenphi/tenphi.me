import { tasty } from '@tenphi/tasty';
import Container from './ui/Container';
import AppearanceSettings from './AppearanceSettings';

const StickyContainer = tasty(Container, {
  styles: {
    position: 'sticky',
    inset: {
      _: '0 top',
      '@supports(container-type: scroll-state) & @(scroll-state(scrolled: block-end))':
        '-10x top',
    },
    transition: 'inset .5s',
    zIndex: 100,
    padding: {
      '': '2x 0',
      '@mobile': '1x 0',
    },
    width: {
      '': 'initial (100dvw - 2x) ($max-width + 2x)',
      '@tablet': 'initial (100dvw - 4x) ($max-width + 2x)',
    },
  },
});

const HeaderEl = tasty({
  as: 'header',
  styles: {
    recipe: 'glass',
    // The appearance popover (inside the header) is open.
    '@appearance-open':
      ':has([data-appearance]:focus-within:not([data-collapsed]))',
    // A view transition name or a `backdrop-filter` makes the header a
    // backdrop root: nothing inside it, the glass popover included, could blur
    // the page behind. So while the popover is open, the header drops both and
    // its blur moves to the Backdrop layer below, which looks the same.
    // Navigating moves focus out of the popover first, so page transitions
    // still capture the header.
    viewTransitionName: {
      '': 'header',
      '@appearance-open': 'none',
    },
    backdropFilter: {
      '': 'blur(1x)',
      '@appearance-open | @high-contrast': 'none',
    },
    radius: '1cr',
    padding: '1.5x',
    shadow: '0 .5x 1x #shadow',
    '#glass-fill': {
      '': '#surface.5',
      '@high-contrast': '#surface-topbar',
    },
    // The bar is translucent, so its edge derives from the opaque surface and
    // stays a solid line over whatever scrolls underneath.
    '#glass-edge': {
      '': '#surface',
      '@high-contrast': '#surface-topbar',
    },

    Edge: { $: '&::before', recipe: 'glass-edge' },
    // The header's blur while the popover is open: a layer behind the bar.
    Backdrop: {
      $: '&::after',
      content: '""',
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      radius: 'inherit',
      pointerEvents: 'none',
      backdropFilter: {
        '': 'none',
        '@appearance-open & !@high-contrast': 'blur(1x)',
      },
    },

    Nav: {
      display: 'flex',
      flow: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    SiteName: {
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      margin: '-1x 0',
    },
    Avatar: {
      display: 'block',
      width: '5x',
      height: '5x',
    },
    NavLinks: {
      display: 'flex',
      flow: 'row',
      gap: '2x',
      alignItems: 'center',
    },
    NavLink: {
      preset: 'nav',
      color: {
        '': '#text-soft',
        '@own(:hover)': '#text',
      },
      textDecoration: 'none',
      transition: 'color 0.15s',
    },
  },
  elements: {
    Nav: 'nav',
    SiteName: 'a',
    Avatar: 'img',
    NavLinks: 'div',
    NavLink: 'a',
  },
});

export default function Header() {
  return (
    <StickyContainer>
      <HeaderEl>
        <HeaderEl.Nav>
          <HeaderEl.SiteName href="/">
            <HeaderEl.Avatar
              src="/avatar-face.svg"
              alt="tenphi.me"
              width={40}
              height={40}
            />
          </HeaderEl.SiteName>
          <HeaderEl.NavLinks>
            <HeaderEl.NavLink href="/portfolio">Portfolio</HeaderEl.NavLink>
            <HeaderEl.NavLink href="/blog">Blog</HeaderEl.NavLink>
            <AppearanceSettings />
          </HeaderEl.NavLinks>
        </HeaderEl.Nav>
      </HeaderEl>
    </StickyContainer>
  );
}
