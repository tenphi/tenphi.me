import { tasty } from '@tenphi/tasty';

// A plain accent pill, not glass: tags aren't buttons.
const Tag = tasty({
  as: 'span',
  styles: {
    preset: 'label',
    padding: '1bw (.75x + 1bw)',
    radius: 'round',
    color: '#accent-surface-text',
    fill: '#accent-surface',
    whiteSpace: 'nowrap',
  },
});

export default Tag;
