import { tasty } from '@tenphi/tasty';

const Text = tasty({
  as: 'p',
  styles: {
    color: '#text',
    preset: 't1',
    margin: '0',
  },
  styleProps: ['preset', 'color', 'textAlign'],
});

export default Text;
