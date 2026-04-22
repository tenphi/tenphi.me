import { tasty } from '@tenphi/tasty';
import Container from './ui/Container';

const FooterEl = tasty({
  as: 'footer',
  styles: {
    display: 'flex',
    preset: 't3',
    padding: '4x 0',
    color: '#text-soft',
    placeContent: 'center',
    width: '100%',
  },
});

export default function Footer() {
  return (
    <Container>
      <FooterEl>&copy; 2026 Andrey Yamanov</FooterEl>
    </Container>
  );
}
