import { tasty } from '@tenphi/tasty';

const Tag = tasty({
  as: 'span',
  styles: {
    preset: 'label',
    padding: '1bw (.5x + 1bw)',
    radius: '1r',
    color: '#accent-surface-text',
    fill: '#accent-surface',
    whiteSpace: 'nowrap',
    shadow: '$glass-accent-shadow',
  },
});

export default Tag;
