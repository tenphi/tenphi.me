import { tasty } from '@tenphi/tasty';
import Container from './ui/Container';

const HeaderEl = tasty({
  as: 'header',
  styles: {
    padding: '3x 0',

    Nav: {
      display: 'flex',
      flow: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    SiteName: {
      preset: 't1',
      fontWeight: '700',
      color: '#text',
      textDecoration: 'none',
    },
    NavLinks: {
      display: 'flex',
      flow: 'row',
      gap: '3x',
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
    NavLinks: 'div',
    NavLink: 'a',
  },
});

export default function Header() {
  return (
    <HeaderEl>
      <Container>
        <HeaderEl.Nav>
          <HeaderEl.SiteName href="/">tenphi.me</HeaderEl.SiteName>
          <HeaderEl.NavLinks>
            <HeaderEl.NavLink href="/portfolio">Portfolio</HeaderEl.NavLink>
            <HeaderEl.NavLink href="/blog">Blog</HeaderEl.NavLink>
          </HeaderEl.NavLinks>
        </HeaderEl.Nav>
      </Container>
    </HeaderEl>
  );
}
