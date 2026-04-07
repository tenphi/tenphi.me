import { tasty } from '@tenphi/tasty';

const Link = tasty({
  as: 'a',
  styles: {
    color: {
      '': '#accent-text',
      ':hover': '#accent-text-hover',
    },
    textDecoration: {
      '': 'none',
      ':hover': 'underline',
    },
    transition: 'color 0.15s',
  },
});

export default Link;
