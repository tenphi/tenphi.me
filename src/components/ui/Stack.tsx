import { tasty } from '@tenphi/tasty';

const Stack = tasty({
  as: 'div',
  styles: {
    display: 'flex',
    flow: 'column',
    gap: '2x',
  },
  styleProps: ['flow', 'gap', 'align', 'justify', 'padding'],
});

export default Stack;
