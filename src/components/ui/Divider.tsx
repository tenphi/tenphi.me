import { tasty } from '@tenphi/tasty';

const Divider = tasty({
  as: 'hr',
  styles: {
    border: 'none',
    height: '1px',
    fill: '#border',
    margin: '3x 0',
  },
  styleProps: ['margin'],
});

export default Divider;
