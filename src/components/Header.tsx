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
    viewTransitionName: 'header',
    position: 'relative',
    radius: '1cr',
    padding: '1.5x',
    shadow: '0 .5x 1x #shadow',
    fill: {
      '': '#surface.5',
      '@high-contrast': '#surface-topbar',
    },
    image: {
      '': 'linear-gradient(to bottom, #surface.75, #surface-down.1)',
      '@high-contrast': 'none',
    },
    backdropFilter: {
      '': 'blur(1x)',
      '@high-contrast': 'none',
    },

    Border: {
      $: '&::before',
      content: '""',
      radius: '1cr',
      border: {
        '': '#surface.5',
        '@high-contrast': '#border',
      },
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
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
    },
    Avatar: {
      display: 'block',
      width: '5x',
      height: '5x',
      margin: '-1x 0',
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
