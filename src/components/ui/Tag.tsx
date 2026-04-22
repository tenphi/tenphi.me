import { tasty } from '@tenphi/tasty';

const Tag = tasty({
  as: 'span',
  styles: {
    preset: 'label',
    padding: '0 .5x',
    radius: '1r',
    color: '#accent-surface-text',
    fill: '#accent-surface',
    whiteSpace: 'nowrap',
    shadow: '0 1px 1px #tiny-shadow',
  },
});

export default Tag;
