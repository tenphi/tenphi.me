import { tasty } from '@tenphi/tasty';

const Container = tasty({
  as: 'div',
  styles: {
    width: {
      '': 'initial (100dvw - 4x) $max-width',
      '@tablet': 'initial (100dvw - 6x) $max-width',
    },
    margin: 'auto left right',
  },
  styleProps: ['padding'],
});

export default Container;
