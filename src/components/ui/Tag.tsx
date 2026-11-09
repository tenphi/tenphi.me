import { tasty } from '@tenphi/tasty';

const Tag = tasty({
  as: 'span',
  styles: {
    recipe: 'glass glass-accent',
    preset: 'label',
    padding: '1bw (.5x + 1bw)',
    radius: '1r',
    color: '#accent-surface-text',
    '#glass-fill': '#accent-surface',
    whiteSpace: 'nowrap',

    Edge: { $: '&::before', recipe: 'glass-edge' },
  },
});

export default Tag;
