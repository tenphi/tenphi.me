import { tasty } from '@tenphi/tasty';
import Container from './ui/Container';

const FooterEl = tasty({
  as: 'footer',
  styles: {
    preset: 't3',
    padding: '4x 0',
    color: '#text-soft',
  },
});

export default function Footer() {
  return (
    <FooterEl>
      <Container>&copy; 2026 Andrey Yamanov</Container>
    </FooterEl>
  );
}
