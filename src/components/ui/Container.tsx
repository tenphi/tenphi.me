import { tasty } from '@tenphi/tasty';

const Container = tasty({
  as: 'div',
  styles: {
    width: 'initial 100% $max-width',
    margin: 'auto left right',
    padding: {
      '': '0 2x',
      '@tablet': '0 3x',
    },
  },
  styleProps: ['padding'],
});

export default Container;
