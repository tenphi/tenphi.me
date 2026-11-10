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

    // The topbar's frosted blur, on a layer under the bar.
    // - A `backdrop-filter` only samples what's right behind its element and
    //   mirrors it at the edges, so content crossing the bar's edge would show
    //   hard cuts. This layer reaches 3x past the bar on every side, so it
    //   sees that content, and its mask cuts it back to the bar's rounded box
    //   (the content box: the 3x padding minus the 3x reach).
    // - It sits here, beside the header, not inside it: the header has a view
    //   transition name, which makes it a backdrop root, so a blur inside it
    //   couldn't see the page.
    Backdrop: {
      $: '&::before',
      content: '""',
      position: 'absolute',
      // The header's box (the container's padding), grown by 3x.
      inset: {
        '': '-1x -3x',
        '@mobile': '-2x -3x',
      },
      padding: '3x',
      radius: '(1cr + 3x)',
      pointerEvents: 'none',
      mask: 'linear-gradient(white, white) content-box',
      backdropFilter: {
        '': 'blur(1x)',
        '@high-contrast': 'none',
      },
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
    // A view transition name makes the header a backdrop root: nothing inside
    // it, the glass popover included, could blur the page behind. So the
    // header drops its name while the popover is open. Navigating moves focus
    // out of the popover first, so page transitions still capture the header.
    viewTransitionName: {
      '': 'header',
      '@appearance-open': 'none',
    },
    // The popover closes after a 150ms delay and an 80ms fade. Its blur needs
    // the page until then, so the name comes back only after 250ms. Opening
    // drops it at once.
    transition: {
      '': 'view-transition-name 0s 250ms allow-discrete',
      '@appearance-open': 'none',
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
