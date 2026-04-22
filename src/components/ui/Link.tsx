import { tasty } from '@tenphi/tasty';

const Link = tasty({
  as: 'a',
  styles: {
    preset: 'bold',
    color: {
      '': '#accent-text',
      ':hover': '#accent-text-2',
    },
    textDecoration: {
      '': 'none',
      ':hover': 'underline',
    },
    transition: 'color 0.15s',
  },
  styleProps: ['color'],
});

export default Link;
